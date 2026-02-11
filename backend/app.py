from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt
from datetime import datetime, timedelta
from config import Config
from database import execute_query
from services.usda_fdc import (
    search_nutrition as usda_fdc_search,
    calculate_nutrition as usda_fdc_calculate,
    get_food_details as usda_fdc_get_details,
    convert_to_grams,
    get_cache_stats,
    clear_cache,
    APIError
)
from services.edamam_vision import (
    search_food_by_text as edamam_search,
)
from services.logmeal_vision import (
    analyze_food_image as logmeal_analyze_image,
    get_api_status as get_logmeal_status,
)

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)

CORS(app, origins=[
    'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000',
    'https://suario.divinelifememorialpark.com', 'http://suario.divinelifememorialpark.com',
])
jwt = JWTManager(app)


def _calculate_calorie_goal(weight_kg, height_cm, age_years, gender, activity_level, goal_type, goal_weight_kg=None):
    """
    Calculate daily calorie goal using BMR (Mifflin-St Jeor) + activity + goal adjustment.
    weight_kg, height_cm: numbers
    age_years: int
    gender: 'male' | 'female'
    activity_level: 'not-active'|'lightly-active'|'active'|'very-active' or DB values
    goal_type: 'lose_weight'|'maintain_weight'|'gain_weight'|'gain_muscle'
    goal_weight_kg: optional, for lose/gain weight
    """
    try:
        w = float(weight_kg or 70)
        h = float(height_cm or 170)
        a = int(age_years or 30)
    except (TypeError, ValueError):
        return 2000

    # BMR Mifflin-St Jeor: male +5, female -161
    if (gender or '').lower() == 'female':
        bmr = (10 * w) + (6.25 * h) - (5 * a) - 161
    else:
        bmr = (10 * w) + (6.25 * h) - (5 * a) + 5

    # Activity multipliers (signup ids and DB values)
    activity_map = {
        'not-active': 1.2, 'sedentary': 1.2,
        'lightly-active': 1.375, 'lightly_active': 1.375,
        'active': 1.55, 'moderately_active': 1.55,
        'very-active': 1.725, 'very_active': 1.725,
        'extremely_active': 1.9, 'extremely_active': 1.9,
    }
    mult = activity_map.get((activity_level or '').lower()) or activity_map.get(activity_level) or 1.55
    tdee = bmr * mult

    # Goal adjustment (MyFitnessPal-style)
    goal = (goal_type or 'maintain_weight').lower().replace(' ', '_')
    if goal in ('lose_weight', 'lose weight'):
        tdee -= 500
    elif goal in ('gain_weight', 'gain weight'):
        tdee += 500
    elif goal in ('gain_muscle', 'build_muscle', 'gain muscle'):
        tdee += 300  # MyFitnessPal-style lean surplus

    result = max(1200, min(4000, round(tdee)))
    return int(result)


def _log_activity(user_id, action_type, user_email=None, user_name=None, description=None, target_user_id=None):
    """Log to user_activity_log for admin Recent Activity. Silently skips if table/columns missing."""
    try:
        execute_query(
            """INSERT INTO user_activity_log (user_id, action_type, user_email, user_name, description, target_user_id)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (user_id, action_type, user_email or '', user_name or '', description or '', target_user_id),
            commit=True
        )
    except Exception:
        try:
            execute_query(
                """INSERT INTO user_activity_log (user_id, action_type, user_email, user_name)
                   VALUES (%s, %s, %s, %s)""",
                (user_id, action_type, user_email or '', user_name or ''),
                commit=True
            )
        except Exception:
            pass


# ============================================================================
# AUTH ROUTES
# ============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        first_name = data.get('firstName', '').strip()
        last_name = data.get('lastName', '').strip()
        nickname = data.get('nickname', first_name).strip()
        
        # Validation
        if not email or not password or not first_name or not last_name:
            return jsonify({'error': 'All fields are required'}), 400
        
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        # Check if user exists
        existing_user = execute_query(
            "SELECT user_id FROM users WHERE email = %s",
            (email,),
            fetch_one=True
        )
        
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insert user (role_id 2 = regular user)
        user_id = execute_query(
            """INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, is_verified)
               VALUES (%s, %s, %s, %s, 2, TRUE, TRUE)""",
            (email, password_hash, first_name, last_name),
            commit=True
        )
        
        # Profile data
        height_cm = data.get('heightCm')
        weight_kg = data.get('weightKg')
        age_years = data.get('ageYears')
        if age_years is not None:
            try:
                age_years = int(age_years)
            except (TypeError, ValueError):
                age_years = None
        gender = data.get('gender')
        if gender and gender not in ('male', 'female', 'other', 'prefer_not_to_say'):
            gender = None
        target_weight_kg = data.get('goalWeightKg')
        if target_weight_kg is not None:
            try:
                target_weight_kg = float(target_weight_kg)
            except (TypeError, ValueError):
                target_weight_kg = None
        activity_level = data.get('activityLevel')
        # Map signup ids to DB enum
        activity_map = {
            'not-active': 'sedentary',
            'lightly-active': 'lightly_active',
            'active': 'moderately_active',
            'very-active': 'very_active',
        }
        activity_db = activity_map.get(activity_level) if activity_level else 'moderately_active'

        goal_type_raw = data.get('goalType') or data.get('goal')
        goal_type_map = {
            'lose weight': 'lose_weight',
            'maintain weight': 'maintain_weight',
            'gain weight': 'gain_weight',
            'gain muscle': 'build_muscle',
        }
        goal_type = 'maintain_weight'
        if goal_type_raw:
            gt = (goal_type_raw or '').strip().lower()
            goal_type = goal_type_map.get(gt, 'maintain_weight' if gt not in goal_type_map.values() else gt.replace(' ', '_'))

        avatar_url = f'https://ui-avatars.com/api/?name={first_name}+{last_name}&background=random'

        # Insert profile (try with age_years, fallback without)
        try:
            execute_query(
                """INSERT INTO user_profiles (user_id, profile_picture_url, height_cm, current_weight_kg, target_weight_kg, age_years, gender, activity_level)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (user_id, avatar_url, height_cm, weight_kg, target_weight_kg, age_years, gender, activity_db),
                commit=True
            )
        except Exception:
            execute_query(
                """INSERT INTO user_profiles (user_id, profile_picture_url, height_cm, current_weight_kg, target_weight_kg, gender, activity_level)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (user_id, avatar_url, height_cm, weight_kg, target_weight_kg, gender, activity_db),
                commit=True
            )

        # Calculate calorie goal using BMR
        calorie_goal = _calculate_calorie_goal(
            weight_kg=weight_kg,
            height_cm=height_cm,
            age_years=age_years,
            gender=gender,
            activity_level=activity_level or activity_db,
            goal_type=goal_type,
            goal_weight_kg=target_weight_kg
        )
        protein = max(50, round(calorie_goal * 0.3 / 4))
        carbs = max(100, round(calorie_goal * 0.4 / 4))
        fat = max(45, round(calorie_goal * 0.3 / 9))

        execute_query(
            """INSERT INTO user_goals (user_id, goal_type, daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, start_date, is_active)
               VALUES (%s, %s, %s, %s, %s, %s, CURDATE(), TRUE)""",
            (user_id, goal_type, calorie_goal, protein, carbs, fat),
            commit=True
        )
        
        # Log signup activity for admin Recent Activity
        try:
            execute_query(
                """INSERT INTO user_activity_log (user_id, action_type, user_email, user_name)
                   VALUES (%s, 'signup', %s, %s)""",
                (user_id, email, f"{first_name} {last_name}".strip()),
                commit=True
            )
        except Exception:
            pass  # Table may not exist yet
        
        # Generate token
        access_token = create_access_token(identity=str(user_id))
        
        # Include profile and goals for client
        user_profile = {
            'heightCm': float(height_cm) if height_cm is not None else None,
            'weightKg': float(weight_kg) if weight_kg is not None else None,
            'gender': gender,
            'ageYears': age_years,
        }
        goals_data = {
            'dailyCalorieGoal': calorie_goal,
            'proteinGoal': protein,
            'carbsGoal': carbs,
            'fatGoal': fat,
        }
        return jsonify({
            'message': 'Registration successful',
            'token': access_token,
            'user': {
                'id': user_id,
                'email': email,
                'firstName': first_name,
                'lastName': last_name,
                'nickname': nickname or first_name,
                'role': 'user',
                'profile': user_profile,
                'goals': goals_data
            }
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500


@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """Record logout and return (client should clear token after)"""
    try:
        user_id = get_jwt_identity()
        user = execute_query(
            "SELECT email, first_name, last_name FROM users WHERE user_id = %s",
            (user_id,),
            fetch_one=True
        )
        if user:
            try:
                execute_query(
                    """INSERT INTO user_activity_log (user_id, action_type, user_email, user_name)
                       VALUES (%s, 'logout', %s, %s)""",
                    (user_id, user['email'], f"{user.get('first_name') or ''} {user.get('last_name') or ''}".strip()),
                    commit=True
                )
            except Exception:
                pass
        return jsonify({'message': 'Logged out'}), 200
    except Exception:
        return jsonify({'message': 'Logged out'}), 200  # Always return 200 so client can clear token


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return token"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Get user from database
        user = execute_query(
            """SELECT u.user_id, u.email, u.password_hash, u.first_name, u.last_name, 
                      u.is_active, r.role_name
               FROM users u
               JOIN roles r ON u.role_id = r.role_id
               WHERE u.email = %s""",
            (email,),
            fetch_one=True
        )
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user['is_active']:
            return jsonify({'error': 'Account is disabled'}), 403
        
        # Verify password (password_hash may be str or bytes from DB)
        stored_hash = user['password_hash']
        if isinstance(stored_hash, str):
            stored_hash = stored_hash.encode('utf-8')
        if not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Update last login
        execute_query(
            "UPDATE users SET last_login = NOW() WHERE user_id = %s",
            (user['user_id'],),
            commit=True
        )
        
        # Log login activity for admin Recent Activity
        try:
            execute_query(
                """INSERT INTO user_activity_log (user_id, action_type, user_email, user_name)
                   VALUES (%s, 'login', %s, %s)""",
                (user['user_id'], user['email'], f"{user['first_name'] or ''} {user['last_name'] or ''}".strip()),
                commit=True
            )
        except Exception:
            pass  # Table may not exist yet
        
        # Get user profile and goals
        profile = execute_query(
            "SELECT * FROM user_profiles WHERE user_id = %s",
            (user['user_id'],),
            fetch_one=True
        )
        
        goals = execute_query(
            "SELECT * FROM user_goals WHERE user_id = %s AND is_active = TRUE",
            (user['user_id'],),
            fetch_one=True
        )
        
        # Generate token
        access_token = create_access_token(identity=str(user['user_id']))
        
        # Build nickname (first name as default)
        nickname = user['first_name']
        
        # Include profile (height/weight) so Profile page can pre-fill from sign-up data
        user_profile = None
        if profile:
            user_profile = {
                'heightCm': float(profile['height_cm']) if profile.get('height_cm') is not None else None,
                'weightKg': float(profile['current_weight_kg']) if profile.get('current_weight_kg') is not None else None,
            }
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': user['user_id'],
                'email': user['email'],
                'firstName': user['first_name'],
                'lastName': user['last_name'],
                'nickname': nickname,
                'role': user['role_name'],
                'avatar': profile['profile_picture_url'] if profile else None,
                'profile': user_profile,
                'goals': {
                    'dailyCalorieGoal': goals['daily_calorie_goal'] if goals else 2000,
                    'proteinGoal': goals['protein_goal_g'] if goals else 150,
                    'carbsGoal': goals['carbs_goal_g'] if goals else 250,
                    'fatGoal': goals['fat_goal_g'] if goals else 65
                } if goals else None
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    try:
        user_id = get_jwt_identity()
        
        user = execute_query(
            """SELECT u.user_id, u.email, u.first_name, u.last_name, r.role_name
               FROM users u
               JOIN roles r ON u.role_id = r.role_id
               WHERE u.user_id = %s AND u.is_active = TRUE""",
            (user_id,),
            fetch_one=True
        )
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        profile = execute_query(
            "SELECT * FROM user_profiles WHERE user_id = %s",
            (user_id,),
            fetch_one=True
        )
        
        goals = execute_query(
            "SELECT * FROM user_goals WHERE user_id = %s AND is_active = TRUE",
            (user_id,),
            fetch_one=True
        )
        
        return jsonify({
            'user': {
                'id': user['user_id'],
                'email': user['email'],
                'firstName': user['first_name'],
                'lastName': user['last_name'],
                'nickname': user['first_name'],
                'role': user['role_name'],
                'avatar': profile['profile_picture_url'] if profile else None,
                'profile': {
                    'heightCm': float(profile['height_cm']) if profile and profile['height_cm'] else None,
                    'weightKg': float(profile['current_weight_kg']) if profile and profile['current_weight_kg'] else None,
                    'activityLevel': profile['activity_level'] if profile else None
                } if profile else None,
                'goals': {
                    'dailyCalorieGoal': goals['daily_calorie_goal'] if goals else 2000,
                    'proteinGoal': goals['protein_goal_g'] if goals else 150,
                    'carbsGoal': goals['carbs_goal_g'] if goals else 250,
                    'fatGoal': goals['fat_goal_g'] if goals else 65
                } if goals else None
            }
        }), 200
        
    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({'error': 'Failed to get user'}), 500


# ============================================================================
# USER GOALS ROUTES
# ============================================================================

@app.route('/api/user/goals/calculate', methods=['GET'])
@jwt_required()
def calculate_user_goals():
    """Calculate recommended calorie goal from user profile (BMR + activity + goal)."""
    try:
        user_id = get_jwt_identity()
        profile = execute_query(
            "SELECT * FROM user_profiles WHERE user_id = %s",
            (user_id,),
            fetch_one=True
        )
        goals = execute_query(
            "SELECT goal_type FROM user_goals WHERE user_id = %s AND is_active = TRUE",
            (user_id,),
            fetch_one=True
        )
        if not profile:
            return jsonify({'goals': {'dailyCalorieGoal': 2000, 'proteinGoal': 150, 'carbsGoal': 250, 'fatGoal': 65}}), 200
        goal_type = goals['goal_type'] if goals else 'maintain_weight'
        age = profile.get('age_years')
        if age is None and profile.get('date_of_birth'):
            try:
                from datetime import date
                dob = profile['date_of_birth']
                age = (date.today() - dob).days // 365
            except Exception:
                age = 30
        calorie_goal = _calculate_calorie_goal(
            weight_kg=profile.get('current_weight_kg'),
            height_cm=profile.get('height_cm'),
            age_years=age,
            gender=profile.get('gender'),
            activity_level=profile.get('activity_level'),
            goal_type=goal_type,
            goal_weight_kg=profile.get('target_weight_kg')
        )
        protein = max(50, round(calorie_goal * 0.3 / 4))
        carbs = max(100, round(calorie_goal * 0.4 / 4))
        fat = max(45, round(calorie_goal * 0.3 / 9))
        return jsonify({
            'goals': {
                'dailyCalorieGoal': calorie_goal,
                'proteinGoal': protein,
                'carbsGoal': carbs,
                'fatGoal': fat
            }
        }), 200
    except Exception as e:
        print(f"Calculate goals error: {e}")
        return jsonify({'error': 'Failed to calculate goals'}), 500


@app.route('/api/user/goals', methods=['GET'])
@jwt_required()
def get_user_goals():
    """Get user's calorie and macro goals"""
    try:
        user_id = get_jwt_identity()
        
        goals = execute_query(
            "SELECT * FROM user_goals WHERE user_id = %s AND is_active = TRUE",
            (user_id,),
            fetch_one=True
        )
        
        if not goals:
            # Return default goals
            return jsonify({
                'goals': {
                    'dailyCalorieGoal': 2000,
                    'proteinGoal': 150,
                    'carbsGoal': 250,
                    'fatGoal': 65
                }
            }), 200
        
        return jsonify({
            'goals': {
                'dailyCalorieGoal': goals['daily_calorie_goal'],
                'proteinGoal': goals['protein_goal_g'],
                'carbsGoal': goals['carbs_goal_g'],
                'fatGoal': goals['fat_goal_g'],
                'goalType': goals['goal_type']
            }
        }), 200
        
    except Exception as e:
        print(f"Get goals error: {e}")
        return jsonify({'error': 'Failed to get goals'}), 500


@app.route('/api/user/goals', methods=['PUT'])
@jwt_required()
def update_user_goals():
    """Update user's calorie and macro goals"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Deactivate existing goals
        execute_query(
            "UPDATE user_goals SET is_active = FALSE WHERE user_id = %s",
            (user_id,),
            commit=True
        )
        
        # Create new goals
        execute_query(
            """INSERT INTO user_goals (user_id, goal_type, daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, start_date, is_active)
               VALUES (%s, %s, %s, %s, %s, %s, CURDATE(), TRUE)""",
            (
                user_id,
                data.get('goalType', 'maintain_weight'),
                data.get('dailyCalorieGoal', 2000),
                data.get('proteinGoal', 150),
                data.get('carbsGoal', 250),
                data.get('fatGoal', 65)
            ),
            commit=True
        )
        
        return jsonify({'message': 'Goals updated successfully'}), 200
        
    except Exception as e:
        print(f"Update goals error: {e}")
        return jsonify({'error': 'Failed to update goals'}), 500


# ============================================================================
# USER PROFILE ROUTES
# ============================================================================

def _safe_float(val):
    """Convert to float for JSON; MySQL may return Decimal."""
    if val is None:
        return None
    try:
        return float(val)
    except (TypeError, ValueError):
        return None

def _safe_date_str(val):
    """Convert date/datetime to string for JSON."""
    if val is None:
        return None
    try:
        return str(val) if hasattr(val, 'isoformat') else str(val)
    except Exception:
        return None

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get user's profile information"""
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            pass  # keep as string for query
        
        user = execute_query(
            """SELECT u.user_id, u.email, u.first_name, u.last_name,
                      p.height_cm, p.current_weight_kg, p.date_of_birth, p.gender,
                      p.profile_picture_url
               FROM users u
               LEFT JOIN user_profiles p ON u.user_id = p.user_id
               WHERE u.user_id = %s""",
            (user_id,),
            fetch_one=True
        )
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        nickname = user.get('first_name') or ''
        try:
            row = execute_query(
                "SELECT nickname FROM users WHERE user_id = %s",
                (user_id,),
                fetch_one=True
            )
            if row and row.get('nickname') is not None:
                nickname = row['nickname'] or ''
        except Exception:
            pass  # Column may not exist
        
        goals = execute_query(
            "SELECT daily_calorie_goal FROM user_goals WHERE user_id = %s AND is_active = TRUE",
            (user_id,),
            fetch_one=True
        )
        daily_calorie = 2000
        if goals and goals.get('daily_calorie_goal') is not None:
            try:
                daily_calorie = int(goals['daily_calorie_goal'])
            except (TypeError, ValueError):
                pass
        
        return jsonify({
            'profile': {
                'userId': user['user_id'],
                'email': user['email'] or '',
                'firstName': user['first_name'] or '',
                'lastName': user['last_name'] or '',
                'nickname': nickname,
                'fullName': f"{user['first_name'] or ''} {user['last_name'] or ''}".strip(),
                'heightCm': _safe_float(user.get('height_cm')),
                'weightKg': _safe_float(user.get('current_weight_kg')),
                'dateOfBirth': _safe_date_str(user.get('date_of_birth')),
                'gender': user.get('gender') or '',
                'avatarUrl': user.get('profile_picture_url') or '',
                'dailyCalorieGoal': daily_calorie
            }
        }), 200
        
    except Exception as e:
        err_msg = str(e) if e else 'Failed to get profile'
        print(f"Get profile error: {e}")
        return jsonify({'error': err_msg}), 500


@app.route('/api/user/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """Update user's profile information"""
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            pass
        data = request.get_json() or {}
        
        # Normalize optional fields: empty string or invalid enum -> None (avoids MySQL errors)
        VALID_GENDERS = ('male', 'female', 'other', 'prefer_not_to_say')
        gender = data.get('gender')
        if gender == '' or (gender is not None and gender not in VALID_GENDERS):
            gender = None
        date_of_birth = data.get('dateOfBirth')
        if date_of_birth == '':
            date_of_birth = None
        avatar_url = data.get('avatarUrl')
        if avatar_url == '':
            avatar_url = None
        height_cm = data.get('heightCm')
        if height_cm is not None and (height_cm == '' or (isinstance(height_cm, (int, float)) and (height_cm < 0 or height_cm > 300))):
            height_cm = None
        elif height_cm is not None and not isinstance(height_cm, (int, float)):
            try:
                height_cm = float(height_cm) if height_cm else None
            except (TypeError, ValueError):
                height_cm = None
        weight_kg = data.get('weightKg')
        if weight_kg is not None and (weight_kg == '' or (isinstance(weight_kg, (int, float)) and (weight_kg < 0 or weight_kg > 500))):
            weight_kg = None
        elif weight_kg is not None and not isinstance(weight_kg, (int, float)):
            try:
                weight_kg = float(weight_kg) if weight_kg else None
            except (TypeError, ValueError):
                weight_kg = None
        
        # Update user table (first_name, last_name only - nickname in separate query for DBs without that column)
        if data.get('firstName') is not None or data.get('lastName') is not None:
            execute_query(
                """UPDATE users SET 
                   first_name = COALESCE(%s, first_name),
                   last_name = COALESCE(%s, last_name),
                   updated_at = NOW()
                   WHERE user_id = %s""",
                (data.get('firstName'), data.get('lastName'), user_id),
                commit=True
            )
        # Update nickname if column exists (migration 001 adds it)
        if data.get('nickname') is not None:
            try:
                execute_query(
                    "UPDATE users SET nickname = %s, updated_at = NOW() WHERE user_id = %s",
                    (data.get('nickname'), user_id),
                    commit=True
                )
            except Exception:
                pass  # Column may not exist on older DBs
        
        # Update daily calorie goal if provided
        if data.get('dailyCalorieGoal') is not None:
            goal_val = int(data['dailyCalorieGoal'])
            goal_val = max(1000, min(10000, goal_val))  # clamp 1000-10000
            existing = execute_query(
                "SELECT goal_id FROM user_goals WHERE user_id = %s AND is_active = TRUE",
                (user_id,),
                fetch_one=True
            )
            if existing:
                execute_query(
                    "UPDATE user_goals SET daily_calorie_goal = %s, updated_at = NOW() WHERE user_id = %s AND is_active = TRUE",
                    (goal_val, user_id),
                    commit=True
                )
            else:
                execute_query(
                    """INSERT INTO user_goals (user_id, goal_type, daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, start_date, is_active)
                       VALUES (%s, 'maintain_weight', %s, 150, 250, 65, CURDATE(), TRUE)""",
                    (user_id, goal_val),
                    commit=True
                )
        
        # Check if profile exists
        existing_profile = execute_query(
            "SELECT profile_id FROM user_profiles WHERE user_id = %s",
            (user_id,),
            fetch_one=True
        )
        
        if existing_profile:
            # Update existing profile (height, weight, DOB, gender, avatar only)
            execute_query(
                """UPDATE user_profiles SET 
                   height_cm = COALESCE(%s, height_cm),
                   current_weight_kg = COALESCE(%s, current_weight_kg),
                   date_of_birth = COALESCE(%s, date_of_birth),
                   gender = COALESCE(%s, gender),
                   profile_picture_url = COALESCE(%s, profile_picture_url),
                   updated_at = NOW()
                   WHERE user_id = %s""",
                (
                    height_cm,
                    weight_kg,
                    date_of_birth,
                    gender,
                    avatar_url,
                    user_id
                ),
                commit=True
            )
        else:
            # Create new profile
            execute_query(
                """INSERT INTO user_profiles 
                   (user_id, height_cm, current_weight_kg, date_of_birth, gender, profile_picture_url)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (
                    user_id,
                    height_cm,
                    weight_kg,
                    date_of_birth,
                    gender,
                    avatar_url
                ),
                commit=True
            )
        
        # Also update weight history if weight changed
        if weight_kg is not None:
            execute_query(
                """INSERT INTO weight_history (user_id, weight_kg, recorded_date)
                   VALUES (%s, %s, CURDATE())
                   ON DUPLICATE KEY UPDATE weight_kg = %s""",
                (user_id, weight_kg, weight_kg),
                commit=True
            )
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        print(f"Update profile error: {e}")
        err_msg = str(e) if e else 'Failed to update profile'
        return jsonify({'error': err_msg}), 500


@app.route('/api/user/deactivate', methods=['POST'])
@jwt_required()
def deactivate_account():
    """Deactivate user account"""
    try:
        user_id = get_jwt_identity()
        
        execute_query(
            "UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE user_id = %s",
            (user_id,),
            commit=True
        )
        
        return jsonify({'message': 'Account deactivated successfully'}), 200
        
    except Exception as e:
        print(f"Deactivate account error: {e}")
        return jsonify({'error': 'Failed to deactivate account'}), 500


# ============================================================================
# FOOD DATABASE ROUTES
# ============================================================================

@app.route('/api/foods/search', methods=['GET'])
@jwt_required()
def search_foods():
    """Search foods in database"""
    try:
        query = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 20))
        
        if not query or len(query) < 2:
            return jsonify({'foods': []}), 200
        
        foods = execute_query(
            """SELECT food_id, food_name, brand_name, serving_size, serving_unit,
                      calories_per_serving, protein_g, carbohydrates_g, fat_g
               FROM foods
               WHERE (food_name LIKE %s OR brand_name LIKE %s) AND is_active = TRUE AND status = 'approved'
               ORDER BY food_name
               LIMIT %s""",
            (f'%{query}%', f'%{query}%', limit),
            fetch_all=True
        )
        
        return jsonify({
            'foods': [{
                'id': f['food_id'],
                'name': f['food_name'],
                'brand': f['brand_name'],
                'servingSize': float(f['serving_size']),
                'servingUnit': f['serving_unit'],
                'caloriesPerServing': float(f['calories_per_serving']),
                'protein': float(f['protein_g']) if f['protein_g'] else 0,
                'carbs': float(f['carbohydrates_g']) if f['carbohydrates_g'] else 0,
                'fat': float(f['fat_g']) if f['fat_g'] else 0
            } for f in foods]
        }), 200
        
    except Exception as e:
        print(f"Search foods error: {e}")
        return jsonify({'error': 'Search failed'}), 500


@app.route('/api/foods/<int:food_id>', methods=['GET'])
@jwt_required()
def get_food(food_id):
    """Get a single food item by ID"""
    try:
        food = execute_query(
            """SELECT * FROM foods WHERE food_id = %s AND is_active = TRUE""",
            (food_id,),
            fetch_one=True
        )
        
        if not food:
            return jsonify({'error': 'Food not found'}), 404
        
        return jsonify({
            'food': {
                'id': food['food_id'],
                'name': food['food_name'],
                'brand': food['brand_name'],
                'servingSize': float(food['serving_size']),
                'servingUnit': food['serving_unit'],
                'caloriesPerServing': float(food['calories_per_serving']),
                'protein': float(food['protein_g']) if food['protein_g'] else 0,
                'carbs': float(food['carbohydrates_g']) if food['carbohydrates_g'] else 0,
                'fat': float(food['fat_g']) if food['fat_g'] else 0,
                'fiber': float(food['fiber_g']) if food['fiber_g'] else 0,
                'sugar': float(food['sugar_g']) if food['sugar_g'] else 0,
                'sodium': float(food['sodium_mg']) if food['sodium_mg'] else 0
            }
        }), 200
        
    except Exception as e:
        print(f"Get food error: {e}")
        return jsonify({'error': 'Failed to get food'}), 500


@app.route('/api/foods/calculate', methods=['POST'])
@jwt_required()
def calculate_food_nutrition():
    """Calculate nutrition based on custom serving size"""
    try:
        data = request.get_json()
        food_id = data.get('foodId')
        custom_amount = float(data.get('amount', 0))
        custom_unit = data.get('unit', 'g')
        
        food = execute_query(
            """SELECT * FROM foods WHERE food_id = %s AND is_active = TRUE""",
            (food_id,),
            fetch_one=True
        )
        
        if not food:
            return jsonify({'error': 'Food not found'}), 404
        
        # Calculate multiplier based on serving size
        # Assuming serving_size is in the same unit as requested
        base_serving = float(food['serving_size'])
        multiplier = custom_amount / base_serving if base_serving > 0 else 1
        
        return jsonify({
            'calculation': {
                'foodId': food_id,
                'foodName': food['food_name'],
                'amount': custom_amount,
                'unit': custom_unit,
                'calories': round(float(food['calories_per_serving']) * multiplier, 1),
                'protein': round(float(food['protein_g'] or 0) * multiplier, 1),
                'carbs': round(float(food['carbohydrates_g'] or 0) * multiplier, 1),
                'fat': round(float(food['fat_g'] or 0) * multiplier, 1)
            }
        }), 200
        
    except Exception as e:
        print(f"Calculate nutrition error: {e}")
        return jsonify({'error': 'Calculation failed'}), 500


# ============================================================================
# USDA FOODDATA CENTRAL NUTRITION ROUTES
# ============================================================================

@app.route('/api/nutrition/search', methods=['GET'])
@jwt_required()
def search_nutrition_api():
    """
    Search for nutritional information using USDA FoodData Central
    Includes caching to avoid redundant API calls
    """
    try:
        query = request.args.get('q', '').strip()
        
        if not query or len(query) < 2:
            return jsonify({'foods': [], 'message': 'Please enter at least 2 characters'}), 200
        
        # Search using USDA FoodData Central
        results = usda_fdc_search(query)
        
        if not results:
            return jsonify({
                'foods': [],
                'message': 'No foods found. Try a different search term.',
                'source': 'usda_fdc'
            }), 200
        
        # Transform results for frontend
        foods = [{
            'id': f"usda_{item.get('fdc_id', i)}",
            'fdcId': item.get('fdc_id'),
            'name': item['name'],
            'calories': item['calories'],
            'servingSize': item['serving_size_g'],
            'servingUnit': 'g',
            'protein': item['protein_g'],
            'carbs': item['carbohydrates_total_g'],
            'fat': item['fat_total_g'],
            'fiber': item['fiber_g'],
            'sugar': item['sugar_g'],
            'sodium': item['sodium_mg'],
            'saturatedFat': item['fat_saturated_g'],
            'cholesterol': item['cholesterol_mg'],
            'potassium': item['potassium_mg'],
            'dataType': item.get('data_type', 'Unknown'),
            'source': 'usda_fdc'
        } for i, item in enumerate(results)]
        
        return jsonify({
            'foods': foods,
            'count': len(foods),
            'source': 'usda_fdc',
            'query': query
        }), 200
        
    except APIError as e:
        print(f"USDA FDC error: {e.message}")
        return jsonify({
            'error': e.message,
            'foods': []
        }), e.status_code or 500
        
    except Exception as e:
        print(f"Search nutrition error: {e}")
        return jsonify({
            'error': 'Unable to fetch nutritional data at this time. Please try again.',
            'foods': []
        }), 500


@app.route('/api/nutrition/calculate', methods=['POST'])
@jwt_required()
def calculate_nutrition_api():
    """
    Calculate nutritional values based on custom amount
    Supports various units (g, oz, lb, cups, etc.)
    """
    try:
        data = request.get_json()
        food_data = data.get('food')
        amount = float(data.get('amount', 0))
        unit = data.get('unit', 'g')
        
        if not food_data:
            return jsonify({'error': 'Food data is required'}), 400
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        # Convert amount to grams
        amount_in_grams = convert_to_grams(amount, unit)
        
        # Helper to get value with proper None handling (0 is a valid value!)
        def get_nutrient(keys, default=0):
            for key in keys:
                val = food_data.get(key)
                if val is not None:
                    return val
            return default
        
        # Build food data structure for calculation
        # Handle both frontend field names and API field names
        usda_food_data = {
            'name': food_data.get('name', 'Unknown'),
            'serving_size_g': get_nutrient(['servingSize', 'serving_size_g'], 100),
            'calories': get_nutrient(['calories', 'caloriesPerServing'], 0),
            'protein_g': get_nutrient(['protein', 'protein_g'], 0),
            'carbohydrates_total_g': get_nutrient(['carbs', 'carbohydrates_total_g'], 0),
            'fat_total_g': get_nutrient(['fat', 'fat_total_g'], 0),
            'fiber_g': get_nutrient(['fiber', 'fiber_g'], 0),
            'sugar_g': get_nutrient(['sugar', 'sugar_g'], 0),
            'sodium_mg': get_nutrient(['sodium', 'sodium_mg'], 0),
            'fat_saturated_g': get_nutrient(['saturatedFat', 'fat_saturated_g'], 0),
            'cholesterol_mg': get_nutrient(['cholesterol', 'cholesterol_mg'], 0),
            'potassium_mg': get_nutrient(['potassium', 'potassium_mg'], 0)
        }
        
        print(f"[Calculate] Input food_data: {food_data}")
        print(f"[Calculate] Mapped usda_food_data: {usda_food_data}")
        
        # Calculate nutrition using USDA FDC
        result = usda_fdc_calculate(usda_food_data, amount_in_grams)
        
        if not result:
            return jsonify({'error': 'Calculation failed'}), 400
        
        return jsonify({
            'calculation': {
                'foodName': result['name'],
                'amount': amount,
                'unit': unit,
                'amountInGrams': amount_in_grams,
                'calories': result['calories'],
                'protein': result['protein_g'],
                'carbs': result['carbohydrates_g'],
                'fat': result['fat_g'],
                'fiber': result['fiber_g'],
                'sugar': result['sugar_g'],
                'sodium': result['sodium_mg'],
                'saturatedFat': result['fat_saturated_g'],
                'cholesterol': result['cholesterol_mg'],
                'potassium': result['potassium_mg']
            }
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid amount value'}), 400
    except Exception as e:
        print(f"Calculate nutrition API error: {e}")
        return jsonify({'error': 'Calculation failed'}), 500


@app.route('/api/nutrition/save', methods=['POST'])
@jwt_required()
def save_api_food_to_db():
    """
    Save a food item from USDA FoodData Central to the local database
    This allows users to save frequently used foods
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        food_name = data.get('name', '').strip()
        if not food_name:
            return jsonify({'error': 'Food name is required'}), 400
        
        # Check if food already exists (any source, match by name only to avoid duplicates)
        existing = execute_query(
            """SELECT food_id FROM foods
               WHERE LOWER(TRIM(food_name)) = LOWER(TRIM(%s))
               LIMIT 1""",
            (food_name,),
            fetch_one=True
        )
        
        if existing:
            return jsonify({
                'message': 'Food already exists in database',
                'foodId': existing['food_id']
            }), 200
        
        # Insert new food
        food_id = execute_query(
            """INSERT INTO foods (food_name, serving_size, serving_unit, calories_per_serving,
                                   protein_g, carbohydrates_g, fat_g, fiber_g, sugar_g, sodium_mg,
                                   saturated_fat_g, cholesterol_mg, potassium_mg,
                                   source, status, created_by, is_active)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'api', 'approved', %s, TRUE)""",
            (
                food_name,
                data.get('servingSize', 100),
                data.get('servingUnit', 'g'),
                data.get('calories', 0),
                data.get('protein', 0),
                data.get('carbs', 0),
                data.get('fat', 0),
                data.get('fiber', 0),
                data.get('sugar', 0),
                data.get('sodium', 0),
                data.get('saturatedFat', 0),
                data.get('cholesterol', 0),
                data.get('potassium', 0),
                user_id
            ),
            commit=True
        )
        
        actor = execute_query(
            "SELECT email, first_name, last_name FROM users WHERE user_id = %s",
            (user_id,),
            fetch_one=True
        )
        aname = f"{actor.get('first_name') or ''} {actor.get('last_name') or ''}".strip() if actor else ''
        _log_activity(user_id, 'save_food', actor.get('email') if actor else '', aname, f"Saved food to DB: {food_name}", None)
        return jsonify({
            'message': 'Food saved to database',
            'foodId': food_id
        }), 201
        
    except Exception as e:
        print(f"Save API food error: {e}")
        return jsonify({'error': 'Failed to save food'}), 500


# ============================================================================
# ADMIN USDA FDC ROUTES
# ============================================================================

@app.route('/api/admin/nutrition/cache-stats', methods=['GET'])
@jwt_required()
def get_nutrition_cache_stats():
    """Get USDA FDC cache statistics (admin only)"""
    try:
        user_id = get_jwt_identity()
        
        # Check if admin
        admin_check = execute_query(
            """SELECT r.role_name FROM users u
               JOIN roles r ON u.role_id = r.role_id
               WHERE u.user_id = %s""",
            (user_id,),
            fetch_one=True
        )
        
        if not admin_check or admin_check['role_name'] != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        stats = get_cache_stats()
        
        return jsonify({
            'cacheStats': stats,
            'apiConfigured': bool(Config.USDA_FDC_API_KEY)
        }), 200
        
    except Exception as e:
        print(f"Get cache stats error: {e}")
        return jsonify({'error': 'Failed to get cache stats'}), 500


@app.route('/api/admin/nutrition/clear-cache', methods=['POST'])
@jwt_required()
def clear_nutrition_cache():
    """Clear USDA FDC cache (admin only)"""
    try:
        user_id = get_jwt_identity()
        
        # Check if admin
        admin_check = execute_query(
            """SELECT r.role_name FROM users u
               JOIN roles r ON u.role_id = r.role_id
               WHERE u.user_id = %s""",
            (user_id,),
            fetch_one=True
        )
        
        if not admin_check or admin_check['role_name'] != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        clear_cache()
        
        # Log admin action
        execute_query(
            """INSERT INTO admin_activity_logs (admin_id, action_type, description)
               VALUES (%s, 'other', 'Cleared USDA FDC nutrition cache')""",
            (user_id,),
            commit=True
        )
        
        return jsonify({'message': 'Cache cleared successfully'}), 200
        
    except Exception as e:
        print(f"Clear cache error: {e}")
        return jsonify({'error': 'Failed to clear cache'}), 500


@app.route('/api/admin/nutrition/api-foods', methods=['GET'])
@jwt_required()
def get_api_sourced_foods():
    """Get all foods sourced from USDA FDC API (admin only)"""
    try:
        user_id = get_jwt_identity()
        
        # Check if admin
        admin_check = execute_query(
            """SELECT r.role_name FROM users u
               JOIN roles r ON u.role_id = r.role_id
               WHERE u.user_id = %s""",
            (user_id,),
            fetch_one=True
        )
        
        if not admin_check or admin_check['role_name'] != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get all foods sourced from USDA API or user/admin imports
        foods = execute_query(
            """SELECT f.*, CONCAT(u.first_name, ' ', u.last_name) as added_by_name
               FROM foods f
               LEFT JOIN users u ON f.created_by = u.user_id
               WHERE f.source IN ('api', 'user')
               ORDER BY f.created_at DESC""",
            fetch_all=True
        )
        
        return jsonify({
            'foods': [{
                'id': f['food_id'],
                'name': f['food_name'],
                'servingSize': float(f['serving_size']),
                'servingUnit': f['serving_unit'],
                'calories': float(f['calories_per_serving']),
                'protein': float(f['protein_g']) if f['protein_g'] else 0,
                'carbs': float(f['carbohydrates_g']) if f['carbohydrates_g'] else 0,
                'fat': float(f['fat_g']) if f['fat_g'] else 0,
                'addedBy': f['added_by_name'],
                'createdAt': f['created_at'].isoformat() if f['created_at'] else None,
                'status': f['status']
            } for f in foods],
            'count': len(foods)
        }), 200
        
    except Exception as e:
        print(f"Get API foods error: {e}")
        return jsonify({'error': 'Failed to get API foods'}), 500


@app.route('/api/admin/nutrition/search-test', methods=['GET'])
@jwt_required()
def test_usda_fdc():
    """Test USDA FoodData Central connection (admin only)"""
    try:
        user_id = get_jwt_identity()
        
        # Check if admin
        admin_check = execute_query(
            """SELECT r.role_name FROM users u
               JOIN roles r ON u.role_id = r.role_id
               WHERE u.user_id = %s""",
            (user_id,),
            fetch_one=True
        )
        
        if not admin_check or admin_check['role_name'] != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Test with a simple query
        query = request.args.get('q', 'apple')
        results = usda_fdc_search(query)
        
        return jsonify({
            'success': True,
            'message': 'USDA FoodData Central connection successful',
            'testQuery': query,
            'resultsCount': len(results),
            'sampleResult': results[0] if results else None
        }), 200
        
    except APIError as e:
        return jsonify({
            'success': False,
            'message': e.message,
            'statusCode': e.status_code
        }), 200
        
    except Exception as e:
        print(f"Test API error: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 200


# ============================================================================
# FOOD LOGGING ROUTES
# ============================================================================

@app.route('/api/food-logs', methods=['POST'])
@jwt_required()
def log_food():
    """Log a food item - supports both database foods and direct nutrition data"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        food_id = data.get('foodId')
        meal_type_id = data.get('mealTypeId', 1)  # Default to breakfast
        servings = float(data.get('servings', 1))
        # Handle null date - use today's date as default
        log_date = data.get('date') or datetime.now().strftime('%Y-%m-%d')
        
        # Check if this is direct nutrition data (for USDA FDC foods)
        nutrition_data = data.get('nutritionData')
        
        if nutrition_data:
            # Direct nutrition logging (USDA FDC, AI Scanner, or custom foods)
            calories_consumed = float(nutrition_data.get('calories', 0))
            protein_consumed = float(nutrition_data.get('protein', 0))
            carbs_consumed = float(nutrition_data.get('carbs', 0))
            fat_consumed = float(nutrition_data.get('fat', 0))
            food_name = nutrition_data.get('name', 'Unknown Food')
            food_source = data.get('source', 'api')  # 'api' (USDA) or 'ai_scanned'
            if food_source not in ('api', 'ai_scanned'):
                food_source = 'api'
            
            print(f"[Log Food] Direct nutrition: name={food_name}, source={food_source}, cal={calories_consumed}")
            
            # First, save or find the food in database.
            # To avoid duplicate foods, reuse any existing food with the same name,
            # regardless of original source (user, api, ai_scanned, etc.).
            existing_food = execute_query(
                """SELECT food_id, source
                   FROM foods
                   WHERE LOWER(TRIM(food_name)) = LOWER(TRIM(%s))
                   ORDER BY CASE source
                     WHEN 'user' THEN 0
                     WHEN 'api' THEN 1
                     WHEN 'ai_scanned' THEN 2
                     ELSE 3
                   END
                   LIMIT 1""",
                (food_name,),
                fetch_one=True
            )
            
            if existing_food:
                food_id = existing_food['food_id']
                print(f"[Log Food] Found existing food with id={food_id}")
            else:
                # Insert new food (api or ai_scanned)
                food_id = execute_query(
                    """INSERT INTO foods (food_name, serving_size, serving_unit, calories_per_serving,
                                         protein_g, carbohydrates_g, fat_g, source, status)
                       VALUES (%s, %s, 'g', %s, %s, %s, %s, %s, 'approved')""",
                    (food_name,
                     nutrition_data.get('servingSize', 100),
                     nutrition_data.get('caloriesPerServing', calories_consumed),
                     nutrition_data.get('proteinBase', protein_consumed),
                     nutrition_data.get('carbsBase', carbs_consumed),
                     nutrition_data.get('fatBase', fat_consumed),
                     food_source),
                    commit=True
                )
                print(f"[Log Food] Created new food with id={food_id}")
        else:
            # Traditional food_id based logging
            if not food_id:
                return jsonify({'error': 'Food ID or nutrition data required'}), 400
            
            # Get food info
            food = execute_query(
                "SELECT * FROM foods WHERE food_id = %s",
                (food_id,),
                fetch_one=True
            )
            
            if not food:
                return jsonify({'error': 'Food not found'}), 404
            
            # Calculate consumed values
            calories_consumed = float(food['calories_per_serving']) * servings
            protein_consumed = float(food['protein_g'] or 0) * servings
            carbs_consumed = float(food['carbohydrates_g'] or 0) * servings
            fat_consumed = float(food['fat_g'] or 0) * servings
        
        # Insert food log
        log_id = execute_query(
            """INSERT INTO food_logs (user_id, food_id, meal_type_id, log_date, servings,
                                       calories_consumed, protein_consumed, carbs_consumed, fat_consumed)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (user_id, food_id, meal_type_id, log_date, servings,
             calories_consumed, protein_consumed, carbs_consumed, fat_consumed),
            commit=True
        )
        
        # Update daily summary
        update_daily_summary(user_id, log_date)
        
        return jsonify({
            'message': 'Food logged successfully',
            'logId': log_id
        }), 201
        
    except Exception as e:
        print(f"Log food error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to log food'}), 500


@app.route('/api/food-logs/today', methods=['GET'])
@jwt_required()
def get_today_logs():
    """Get food logs for the user for a given date (default: today). Use ?date=YYYY-MM-DD for another date."""
    try:
        user_id = get_jwt_identity()
        date_param = request.args.get('date')
        log_date = date_param if date_param else datetime.now().strftime('%Y-%m-%d')
        
        logs = execute_query(
            """SELECT fl.*, f.food_name, f.image_url, f.serving_size, f.serving_unit, mt.meal_type_name
               FROM food_logs fl
               JOIN foods f ON fl.food_id = f.food_id
               JOIN meal_types mt ON fl.meal_type_id = mt.meal_type_id
               WHERE fl.user_id = %s AND fl.log_date = %s
               ORDER BY fl.created_at DESC""",
            (user_id, log_date),
            fetch_all=True
        )
        
        return jsonify({
            'logs': [{
                'id': log['log_id'],
                'foodId': log['food_id'],
                'foodName': log['food_name'],
                'mealType': log['meal_type_name'],
                'mealTypeId': log['meal_type_id'],
                'servings': float(log['servings']),
                'servingSize': float(log['serving_size']) if log.get('serving_size') is not None else 100,
                'servingUnit': (log.get('serving_unit') or 'g') or 'g',
                'calories': float(log['calories_consumed']),
                'protein': float(log['protein_consumed']) if log['protein_consumed'] else 0,
                'carbs': float(log['carbs_consumed']) if log['carbs_consumed'] else 0,
                'fat': float(log['fat_consumed']) if log['fat_consumed'] else 0,
                'imageUrl': log['image_url']
            } for log in logs]
        }), 200
        
    except Exception as e:
        print(f"Get today logs error: {e}")
        return jsonify({'error': 'Failed to get logs'}), 500


@app.route('/api/food-logs/history', methods=['GET'])
@jwt_required()
def get_food_log_history():
    """Get food log history grouped by date"""
    try:
        user_id = get_jwt_identity()
        days = int(request.args.get('days', 30))
        
        # Get daily summaries for the past X days
        summaries = execute_query(
            """SELECT ds.*, 
                      ug.daily_calorie_goal as calorie_goal,
                      ug.protein_goal_g as protein_goal,
                      ug.carbs_goal_g as carbs_goal,
                      ug.fat_goal_g as fat_goal
               FROM daily_summaries ds
               LEFT JOIN user_goals ug ON ds.user_id = ug.user_id AND ug.is_active = TRUE
               WHERE ds.user_id = %s 
               AND ds.summary_date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
               ORDER BY ds.summary_date DESC""",
            (user_id, days),
            fetch_all=True
        )
        
        history = []
        for s in summaries:
            # Get detailed logs for this date
            logs = execute_query(
                """SELECT fl.*, f.food_name, mt.meal_type_name
                   FROM food_logs fl
                   JOIN foods f ON fl.food_id = f.food_id
                   JOIN meal_types mt ON fl.meal_type_id = mt.meal_type_id
                   WHERE fl.user_id = %s AND fl.log_date = %s
                   ORDER BY mt.meal_type_id, fl.created_at""",
                (user_id, s['summary_date']),
                fetch_all=True
            )
            
            # Group logs by meal type
            meals = {}
            for log in logs:
                meal_type = log['meal_type_name']
                if meal_type not in meals:
                    meals[meal_type] = {'foods': [], 'totalCalories': 0}
                meals[meal_type]['foods'].append({
                    'name': log['food_name'],
                    'calories': float(log['calories_consumed']),
                    'servings': float(log['servings'])
                })
                meals[meal_type]['totalCalories'] += float(log['calories_consumed'])
            
            calorie_goal = s['calorie_goal'] or 2000
            total_intake = float(s['total_calories'] or 0)
            
            history.append({
                'id': s['summary_id'],
                'date': str(s['summary_date']),
                'totalCalories': total_intake,
                'calorieGoal': calorie_goal,
                'caloriePercentage': min(100, round(total_intake / calorie_goal * 100)),
                'protein': float(s['total_protein_g'] or 0),
                'carbs': float(s['total_carbs_g'] or 0),
                'fat': float(s['total_fat_g'] or 0),
                'meals': meals
            })
        
        return jsonify({'history': history}), 200
        
    except Exception as e:
        print(f"Get history error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to get history'}), 500


@app.route('/api/food-logs/<int:log_id>', methods=['PUT'])
@jwt_required()
def update_food_log(log_id):
    """Update a food log entry (servings, meal type). Recalculates calories from food if servings change."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        log = execute_query(
            """SELECT fl.*, f.serving_size, f.calories_per_serving, f.protein_g, f.carbohydrates_g, f.fat_g
               FROM food_logs fl
               JOIN foods f ON fl.food_id = f.food_id
               WHERE fl.log_id = %s AND fl.user_id = %s""",
            (log_id, user_id),
            fetch_one=True
        )
        if not log:
            return jsonify({'error': 'Log not found'}), 404
        
        serving_size = float(log.get('serving_size') or 100)
        if serving_size <= 0:
            serving_size = 100
        
        amount_grams = data.get('amountGrams')
        servings = data.get('servings')
        meal_type_id = data.get('mealTypeId')
        if amount_grams is not None:
            grams = float(amount_grams)
            if grams <= 0:
                return jsonify({'error': 'Amount (grams) must be greater than 0'}), 400
            servings = grams / serving_size
        elif servings is not None:
            servings = float(servings)
            if servings <= 0:
                return jsonify({'error': 'Servings must be greater than 0'}), 400
        else:
            servings = float(log['servings'])
        if meal_type_id is not None:
            meal_type_id = int(meal_type_id)
            if meal_type_id not in (1, 2, 3, 4):
                return jsonify({'error': 'Invalid meal type'}), 400
        else:
            meal_type_id = log['meal_type_id']
        
        calories_consumed = float(log['calories_per_serving']) * servings
        protein_consumed = float(log['protein_g'] or 0) * servings
        carbs_consumed = float(log['carbohydrates_g'] or 0) * servings
        fat_consumed = float(log['fat_g'] or 0) * servings
        
        execute_query(
            """UPDATE food_logs SET servings = %s, meal_type_id = %s,
               calories_consumed = %s, protein_consumed = %s, carbs_consumed = %s, fat_consumed = %s,
               updated_at = NOW()
               WHERE log_id = %s AND user_id = %s""",
            (servings, meal_type_id, calories_consumed, protein_consumed, carbs_consumed, fat_consumed, log_id, user_id),
            commit=True
        )
        update_daily_summary(user_id, str(log['log_date']))
        return jsonify({'message': 'Food log updated successfully'}), 200
    except Exception as e:
        print(f"Update food log error: {e}")
        return jsonify({'error': 'Failed to update food log'}), 500


@app.route('/api/food-logs/<int:log_id>', methods=['DELETE'])
@jwt_required()
def delete_food_log(log_id):
    """Delete a food log entry"""
    try:
        user_id = get_jwt_identity()
        
        # Get the log to find the date
        log = execute_query(
            "SELECT log_date FROM food_logs WHERE log_id = %s AND user_id = %s",
            (log_id, user_id),
            fetch_one=True
        )
        
        if not log:
            return jsonify({'error': 'Log not found'}), 404
        
        # Delete the log
        execute_query(
            "DELETE FROM food_logs WHERE log_id = %s AND user_id = %s",
            (log_id, user_id),
            commit=True
        )
        
        # Update daily summary
        update_daily_summary(user_id, str(log['log_date']))
        
        return jsonify({'message': 'Food log deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete food log error: {e}")
        return jsonify({'error': 'Failed to delete food log'}), 500


@app.route('/api/daily-summary', methods=['GET'])
@jwt_required()
def get_daily_summary():
    """Get daily summary for today"""
    try:
        user_id = get_jwt_identity()
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        summary = execute_query(
            "SELECT * FROM daily_summaries WHERE user_id = %s AND summary_date = %s",
            (user_id, date),
            fetch_one=True
        )
        
        goals = execute_query(
            "SELECT * FROM user_goals WHERE user_id = %s AND is_active = TRUE",
            (user_id,),
            fetch_one=True
        )
        
        if not summary:
            return jsonify({
                'summary': {
                    'intake': 0,
                    'goal': goals['daily_calorie_goal'] if goals else 2000,
                    'protein': {'current': 0, 'goal': goals['protein_goal_g'] if goals else 150},
                    'carbs': {'current': 0, 'goal': goals['carbs_goal_g'] if goals else 250},
                    'fat': {'current': 0, 'goal': goals['fat_goal_g'] if goals else 65}
                }
            }), 200
        
        return jsonify({
            'summary': {
                'intake': float(summary['total_calories']),
                'goal': goals['daily_calorie_goal'] if goals else 2000,
                'protein': {
                    'current': float(summary['total_protein_g']),
                    'goal': goals['protein_goal_g'] if goals else 150
                },
                'carbs': {
                    'current': float(summary['total_carbs_g']),
                    'goal': goals['carbs_goal_g'] if goals else 250
                },
                'fat': {
                    'current': float(summary['total_fat_g']),
                    'goal': goals['fat_goal_g'] if goals else 65
                },
                'mealsLogged': summary['meals_logged']
            }
        }), 200
        
    except Exception as e:
        print(f"Get daily summary error: {e}")
        return jsonify({'error': 'Failed to get summary'}), 500


def update_daily_summary(user_id, date):
    """Update or create daily summary"""
    try:
        # Calculate totals from food logs
        totals = execute_query(
            """SELECT 
                   COALESCE(SUM(calories_consumed), 0) as total_calories,
                   COALESCE(SUM(protein_consumed), 0) as total_protein,
                   COALESCE(SUM(carbs_consumed), 0) as total_carbs,
                   COALESCE(SUM(fat_consumed), 0) as total_fat,
                   COUNT(*) as meals_logged
               FROM food_logs
               WHERE user_id = %s AND log_date = %s""",
            (user_id, date),
            fetch_one=True
        )
        
        # Get user's calorie goal
        goals = execute_query(
            "SELECT daily_calorie_goal FROM user_goals WHERE user_id = %s AND is_active = TRUE",
            (user_id,),
            fetch_one=True
        )
        
        calorie_goal = goals['daily_calorie_goal'] if goals else 2000
        goal_percentage = (totals['total_calories'] / calorie_goal * 100) if calorie_goal > 0 else 0
        
        # Upsert daily summary
        execute_query(
            """INSERT INTO daily_summaries 
               (user_id, summary_date, total_calories, total_protein_g, total_carbs_g, total_fat_g, 
                calorie_goal, goal_percentage, meals_logged)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
               ON DUPLICATE KEY UPDATE
               total_calories = VALUES(total_calories),
               total_protein_g = VALUES(total_protein_g),
               total_carbs_g = VALUES(total_carbs_g),
               total_fat_g = VALUES(total_fat_g),
               calorie_goal = VALUES(calorie_goal),
               goal_percentage = VALUES(goal_percentage),
               meals_logged = VALUES(meals_logged),
               updated_at = NOW()""",
            (user_id, date, totals['total_calories'], totals['total_protein'],
             totals['total_carbs'], totals['total_fat'], calorie_goal, goal_percentage,
             totals['meals_logged']),
            commit=True
        )
    except Exception as e:
        print(f"Update daily summary error: {e}")


# ============================================================================
# FOOD IMAGE SCANNING (LOGMEAL FOOD AI)
# ============================================================================

@app.route('/api/food-scan/analyze', methods=['POST'])
@jwt_required()
def analyze_food_image_api():
    """
    Analyze a food image using LogMeal Food AI API
    Accepts base64 encoded image data
    """
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'success': False, 'error': 'Invalid request body.', 'foods': []}), 400
        image_data = data.get('image')
        debug = data.get('debug') or request.args.get('debug') == '1' or request.args.get('debug') == 'true'
        
        if not image_data:
            return jsonify({'success': False, 'error': 'Image data is required.', 'foods': []}), 400
        
        result = logmeal_analyze_image(image_data, 'base64', return_debug=debug)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Image analysis failed.'),
                'foods': result.get('foods', [])
            }), 400
            
    except Exception as e:
        print(f"Food scan error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Failed to analyze image: {str(e)}',
            'foods': []
        }), 500


@app.route('/api/food-scan/search', methods=['GET'])
@jwt_required()
def search_food_edamam():
    """
    Search for foods using Edamam's NLP parser
    This can be used as a complement to USDA FDC search
    """
    try:
        query = request.args.get('q', '').strip()
        
        if not query or len(query) < 2:
            return jsonify({'foods': [], 'message': 'Please enter at least 2 characters'}), 200
        
        result = edamam_search(query)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Edamam search error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'foods': []
        }), 500


@app.route('/api/food-scan/status', methods=['GET'])
@jwt_required()
def get_food_scan_status():
    """Check LogMeal Food AI API status"""
    try:
        status = get_logmeal_status()
        return jsonify(status), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


# ============================================================================
# ADMIN ROUTES
# ============================================================================

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (admin only)"""
    try:
        user_id = get_jwt_identity()
        
        # Check if admin
        admin_check = execute_query(
            """SELECT r.role_name FROM users u
               JOIN roles r ON u.role_id = r.role_id
               WHERE u.user_id = %s""",
            (user_id,),
            fetch_one=True
        )
        
        if not admin_check or admin_check['role_name'] != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        users = execute_query(
            """SELECT u.user_id, u.email, u.first_name, u.last_name, u.is_active,
                      u.last_login, u.created_at, r.role_name
               FROM users u
               JOIN roles r ON u.role_id = r.role_id
               ORDER BY u.created_at DESC""",
            fetch_all=True
        )
        
        def _ts(v):
            if v is None:
                return None
            if hasattr(v, 'isoformat'):
                return v.isoformat()
            return str(v)
        return jsonify({
            'users': [{
                'id': u['user_id'],
                'email': u['email'],
                'firstName': u['first_name'],
                'lastName': u['last_name'],
                'role': u['role_name'],
                'isActive': u['is_active'],
                'lastLogin': _ts(u.get('last_login')),
                'createdAt': _ts(u.get('created_at'))
            } for u in users]
        }), 200
        
    except Exception as e:
        print(f"Get users error: {e}")
        return jsonify({'error': 'Failed to get users'}), 500


def _require_admin():
    """Return (admin_user_id, error_response) or (user_id, None)."""
    user_id = get_jwt_identity()
    admin_check = execute_query(
        """SELECT r.role_name FROM users u
           JOIN roles r ON u.role_id = r.role_id
           WHERE u.user_id = %s""",
        (user_id,),
        fetch_one=True
    )
    if not admin_check or admin_check['role_name'] != 'admin':
        return None, (jsonify({'error': 'Unauthorized'}), 403)
    return user_id, None


# ============================================================================
# ADMIN FOOD DATABASE (manual add + Excel import)
# ============================================================================

@app.route('/api/admin/foods', methods=['POST'])
@jwt_required()
def admin_create_food():
    """Create a food with complete nutrition (admin only)."""
    try:
        admin_id, err = _require_admin()
        if err:
            return err[0], err[1]
        data = request.get_json()
        if not data:
            return jsonify({'error': 'JSON body required'}), 400
        food_name = (data.get('foodName') or data.get('name') or '').strip()
        if not food_name:
            return jsonify({'error': 'Food name is required'}), 400
        serving_size = float(data.get('servingSize', 100))
        serving_unit = (data.get('servingUnit') or 'g').strip() or 'g'
        calories = float(data.get('calories', 0))
        protein = float(data.get('protein', 0))
        carbs = float(data.get('carbohydrates', data.get('carbs', 0)))
        fat = float(data.get('fat', 0))
        fiber = float(data.get('fiber', 0))
        sugar = float(data.get('sugar', 0))
        sodium = float(data.get('sodium', 0))
        brand_name = (data.get('brandName') or data.get('brand') or '').strip() or None
        category_id = data.get('categoryId') or data.get('category_id')
        if category_id is not None:
            category_id = int(category_id)
        food_id = execute_query(
            """INSERT INTO foods (food_name, brand_name, category_id, serving_size, serving_unit,
                                 calories_per_serving, protein_g, carbohydrates_g, fat_g,
                                 fiber_g, sugar_g, sodium_mg, source, status, created_by, is_active)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'user', 'approved', %s, TRUE)""",
            (food_name, brand_name, category_id, serving_size, serving_unit,
             calories, protein, carbs, fat, fiber, sugar, sodium, admin_id),
            commit=True
        )
        return jsonify({'message': 'Food created', 'foodId': food_id}), 201
    except ValueError as e:
        return jsonify({'error': f'Invalid number: {e}'}), 400
    except Exception as e:
        print(f"Admin create food error: {e}")
        return jsonify({'error': 'Failed to create food'}), 500


@app.route('/api/admin/foods/import-excel', methods=['POST'])
@jwt_required()
def admin_import_foods_excel():
    """Import foods from Excel (admin only). Expects columns: food_name, serving_size, serving_unit, calories, protein, carbs, fat (optional: fiber, sugar, sodium, brand_name)."""
    try:
        admin_id, err = _require_admin()
        if err:
            return err[0], err[1]
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided. Use form field "file".'}), 400
        file = request.files['file']
        if not file or not file.filename:
            return jsonify({'error': 'No file selected'}), 400
        if not file.filename.lower().endswith(('.xlsx', '.xls')):
            return jsonify({'error': 'File must be Excel (.xlsx or .xls)'}), 400
        try:
            import openpyxl
        except ImportError:
            return jsonify({'error': 'Excel support not installed (openpyxl)'}), 503
        wb = openpyxl.load_workbook(file, read_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return jsonify({'error': 'Sheet is empty'}), 400
        header = [str(c).strip().lower() if c else '' for c in rows[0]]
        # Try to find required columns using common header variants
        name_col = _excel_col(header, ['food_name', 'name', 'food name', 'food', 'food item', 'item', 'product', 'description'])
        serving_col = _excel_col(header, ['serving_size', 'serving size', 'servingsize'])
        unit_col = _excel_col(header, ['serving_unit', 'serving unit', 'unit'])
        cal_col = _excel_col(header, ['calories', 'cal', 'calorie', 'calories (kcal)', 'kcal', 'energy'])
        protein_col = _excel_col(header, ['protein', 'protein_g'])
        carbs_col = _excel_col(header, ['carbohydrates', 'carbs', 'carbohydrates_g'])
        fat_col = _excel_col(header, ['fat', 'fat_g'])
        # Fallback: try substring matching if exact headers not found
        if name_col is None:
            for idx, col in enumerate(header):
                if ('food' in col) or ('name' in col):
                    name_col = idx
                    break
        if cal_col is None:
            for idx, col in enumerate(header):
                if ('calor' in col) or ('kcal' in col) or ('energy' in col):
                    cal_col = idx
                    break
        if name_col is None or cal_col is None:
            return jsonify({'error': 'Sheet must have at least "food name" and "calories" columns'}), 400
        created = 0
        duplicates = 0
        errors = []
        for i, row in enumerate(rows[1:], start=2):
            try:
                name = _cell(row, name_col)
                if not name:
                    continue
                cal = _cell_float(row, cal_col, 0)
                serving = _cell_float(row, serving_col, 100)
                unit = _cell(row, unit_col) or 'g'
                protein = _cell_float(row, protein_col, 0)
                carbs = _cell_float(row, carbs_col, 0)
                fat = _cell_float(row, fat_col, 0)

                # Avoid inserting duplicate foods from Excel (same name = duplicate; source='user')
                existing = execute_query(
                    """SELECT food_id FROM foods
                       WHERE LOWER(TRIM(food_name)) = LOWER(TRIM(%s))
                         AND source = 'user'""",
                    (name[:255],),
                    fetch_one=True
                )
                if existing:
                    duplicates += 1
                    continue

                execute_query(
                    """INSERT INTO foods (food_name, serving_size, serving_unit, calories_per_serving,
                                         protein_g, carbohydrates_g, fat_g, source, status, created_by, is_active)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, 'user', 'approved', %s, TRUE)""",
                    (name[:255], serving, (unit or 'g')[:50], cal, protein, carbs, fat, admin_id),
                    commit=True
                )
                created += 1
            except Exception as e:
                errors.append(f"Row {i}: {str(e)}")
        wb.close()
        return jsonify({
            'message': f'Imported {created} foods. Skipped {duplicates} duplicate rows.',
            'created': created,
            'duplicates': duplicates,
            'errors': errors[:20]
        }), 200
    except Exception as e:
        print(f"Admin import Excel error: {e}")
        return jsonify({'error': str(e)}), 500


def _excel_col(header, names):
    for n in names:
        try:
            idx = header.index(n)
            return idx
        except ValueError:
            continue
    return None


def _cell(row, col_idx):
    if col_idx is None or col_idx >= len(row):
        return None
    v = row[col_idx]
    return str(v).strip() if v is not None else None


def _cell_float(row, col_idx, default):
    if col_idx is None or col_idx >= len(row):
        return default
    v = row[col_idx]
    if v is None:
        return default
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


@app.route('/api/admin/users/<int:target_user_id>/deactivate', methods=['POST'])
@jwt_required()
def admin_deactivate_user(target_user_id):
    """Deactivate a user (admin only). Cannot deactivate self."""
    try:
        admin_id, err = _require_admin()
        if err:
            return err[0], err[1]
        if str(admin_id) == str(target_user_id):
            return jsonify({'error': 'You cannot deactivate your own account'}), 400
        target = execute_query(
            "SELECT email, first_name, last_name FROM users WHERE user_id = %s",
            (target_user_id,),
            fetch_one=True
        )
        execute_query(
            "UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE user_id = %s",
            (target_user_id,),
            commit=True
        )
        admin_user = execute_query(
            "SELECT email, first_name, last_name FROM users WHERE user_id = %s",
            (admin_id,),
            fetch_one=True
        )
        tname = f"{target.get('first_name') or ''} {target.get('last_name') or ''}".strip() or target.get('email') or f"User #{target_user_id}"
        aname = f"{admin_user.get('first_name') or ''} {admin_user.get('last_name') or ''}".strip() or admin_user.get('email') or 'Admin'
        _log_activity(admin_id, 'deactivate', admin_user.get('email'), aname, f"Deactivated user: {tname} ({target.get('email') or ''})", target_user_id)
        return jsonify({'message': 'User deactivated'}), 200
    except Exception as e:
        print(f"Deactivate user error: {e}")
        return jsonify({'error': 'Failed to deactivate user'}), 500


@app.route('/api/admin/users/<int:target_user_id>/activate', methods=['POST'])
@jwt_required()
def admin_activate_user(target_user_id):
    """Activate a user (admin only)."""
    try:
        _, err = _require_admin()
        if err:
            return err[0], err[1]
        execute_query(
            "UPDATE users SET is_active = TRUE, updated_at = NOW() WHERE user_id = %s",
            (target_user_id,),
            commit=True
        )
        return jsonify({'message': 'User activated'}), 200
    except Exception as e:
        print(f"Activate user error: {e}")
        return jsonify({'error': 'Failed to activate user'}), 500


@app.route('/api/admin/users/<int:target_user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(target_user_id):
    """Permanently delete a user (admin only). Cannot delete self."""
    try:
        admin_id, err = _require_admin()
        if err:
            return err[0], err[1]
        if str(admin_id) == str(target_user_id):
            return jsonify({'error': 'You cannot delete your own account'}), 400
        target = execute_query(
            "SELECT email, first_name, last_name FROM users WHERE user_id = %s",
            (target_user_id,),
            fetch_one=True
        )
        admin_user = execute_query(
            "SELECT email, first_name, last_name FROM users WHERE user_id = %s",
            (admin_id,),
            fetch_one=True
        )
        tname = f"{target.get('first_name') or ''} {target.get('last_name') or ''}".strip() if target else f"User #{target_user_id}"
        temail = target.get('email') if target else ''
        aname = f"{admin_user.get('first_name') or ''} {admin_user.get('last_name') or ''}".strip() or admin_user.get('email') or 'Admin'
        execute_query(
            "DELETE FROM users WHERE user_id = %s",
            (target_user_id,),
            commit=True
        )
        _log_activity(admin_id, 'delete_user', admin_user.get('email'), aname, f"Deleted user: {tname} ({temail})", target_user_id)
        return jsonify({'message': 'User deleted'}), 200
    except Exception as e:
        print(f"Delete user error: {e}")
        return jsonify({'error': 'Failed to delete user'}), 500


@app.route('/api/admin/activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    """Get recent user activity (login, logout, signup) for admin dashboard"""
    try:
        user_id = get_jwt_identity()
        admin_check = execute_query(
            """SELECT r.role_name FROM users u
               JOIN roles r ON u.role_id = r.role_id
               WHERE u.user_id = %s""",
            (user_id,),
            fetch_one=True
        )
        if not admin_check or admin_check['role_name'] != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        try:
            rows = execute_query(
                """SELECT id, user_id, action_type, user_email, user_name, created_at, description, target_user_id
                   FROM user_activity_log
                   ORDER BY created_at DESC
                   LIMIT 50""",
                fetch_all=True
            )
        except Exception:
            rows = execute_query(
                """SELECT id, user_id, action_type, user_email, user_name, created_at
                   FROM user_activity_log
                   ORDER BY created_at DESC
                   LIMIT 50""",
                fetch_all=True
            )
        if not rows:
            return jsonify({'activity': []}), 200
        
        def format_ts(ts):
            if ts is None:
                return None
            if hasattr(ts, 'isoformat'):
                return ts.isoformat()
            return str(ts)
        
        def action_label(r):
            if r.get('description'):
                return r['description']
            t = r.get('action_type') or ''
            if t == 'login': return 'logged in'
            if t == 'logout': return 'logged out'
            if t == 'signup': return 'signed up'
            if t == 'deactivate': return 'deactivated a user'
            if t == 'delete_user': return 'deleted a user'
            if t == 'save_food': return 'saved a food to DB'
            return t.replace('_', ' ')
        
        return jsonify({
            'activity': [{
                'id': r['id'],
                'userId': r['user_id'],
                'type': r['action_type'],
                'user': r['user_name'] or r['user_email'] or f"User #{r['user_id']}",
                'email': r['user_email'] or '',
                'action': action_label(r),
                'time': format_ts(r['created_at'])
            } for r in rows]
        }), 200
    except Exception as e:
        print(f"Get activity error: {e}")
        return jsonify({'error': 'Failed to get activity', 'activity': []}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=Config.DEBUG)
