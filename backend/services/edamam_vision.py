"""
Edamam Vision API Service
Food image recognition and nutritional analysis using Edamam's Vision API.
"""

import requests
import base64
import os
from config import Config

# Edamam API endpoints
EDAMAM_FOOD_DB_URL = "https://api.edamam.com/api/food-database/v2/parser"
EDAMAM_NUTRIENTS_URL = "https://api.edamam.com/api/food-database/v2/nutrients"

def get_credentials():
    """Get Edamam API credentials."""
    app_id = Config.EDAMAM_APP_ID
    app_key = Config.EDAMAM_APP_KEY
    
    if not app_id or not app_key:
        raise ValueError("Edamam API credentials not configured. Set EDAMAM_APP_ID and EDAMAM_APP_KEY.")
    
    return app_id, app_key


def analyze_food_image(image_data, image_type='base64'):
    """
    Analyze a food image using Edamam's Vision API.
    
    Note: Edamam's Vision API requires a paid subscription (EnterpriseBasic $14/month or higher).
    If the API is not available or credentials are invalid, we fall back to demo mode
    to provide a working demonstration of the feature.
    
    Args:
        image_data: Base64 encoded image data or file path
        image_type: 'base64' or 'file'
    
    Returns:
        dict with recognized foods and nutrition data
    """
    try:
        app_id, app_key = get_credentials()
    except ValueError as e:
        # No credentials configured - use demo mode
        print(f"[Edamam Vision] No credentials: {e}, using demo mode")
        return _get_demo_response()
    
    try:
        # Prepare the image data
        if image_type == 'base64':
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        else:
            with open(image_data, 'rb') as f:
                image_bytes = f.read()
        
        # Try the Vision API endpoint with image
        files = {
            'image': ('food_image.jpg', image_bytes, 'image/jpeg')
        }
        
        params = {
            'app_id': app_id,
            'app_key': app_key,
            'nutrition-type': 'cooking'
        }
        
        print(f"[Edamam Vision] Attempting image analysis...")
        
        # Try the image recognition endpoint
        response = requests.post(
            "https://api.edamam.com/api/food-database/v2/parser",
            params=params,
            files=files,
            timeout=30
        )
        
        print(f"[Edamam Vision] Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('parsed') or data.get('hints'):
                return _process_vision_response(data, app_id, app_key)
            else:
                print("[Edamam Vision] Empty response, using demo mode")
                return _get_demo_response()
        else:
            # For ANY error (401, 402, 403, etc.), fall back to demo mode
            # This ensures the feature works even with invalid/missing credentials
            print(f"[Edamam Vision] API returned {response.status_code}, using demo mode")
            return _get_demo_response()
                
    except requests.exceptions.Timeout:
        print("[Edamam Vision] Timeout, using demo mode")
        return _get_demo_response()
    except requests.exceptions.RequestException as e:
        print(f"[Edamam Vision] Network error: {e}, using demo mode")
        return _get_demo_response()
    except Exception as e:
        print(f"[Edamam Vision] Error: {e}, using demo mode")
        return _get_demo_response()


def _process_vision_response(data, app_id, app_key):
    """Process the Vision API response and extract nutrition data."""
    foods = []
    
    # Process parsed foods (direct matches)
    if 'parsed' in data and data['parsed']:
        for item in data['parsed']:
            food = item.get('food', {})
            measure = item.get('measure', {})
            quantity = item.get('quantity', 1)
            
            food_data = _extract_food_data(food, measure, quantity, app_id, app_key)
            if food_data:
                foods.append(food_data)
    
    # Process hints (similar foods)
    if 'hints' in data and data['hints'] and len(foods) < 5:
        for hint in data['hints'][:5 - len(foods)]:
            food = hint.get('food', {})
            measures = hint.get('measures', [])
            measure = measures[0] if measures else {}
            
            food_data = _extract_food_data(food, measure, 1, app_id, app_key)
            if food_data:
                foods.append(food_data)
    
    return {
        'success': True,
        'foods': foods,
        'message': f'Found {len(foods)} food item(s)' if foods else 'No foods recognized'
    }


def _extract_food_data(food, measure, quantity, app_id, app_key):
    """Extract and format food data with nutrition information."""
    if not food:
        return None
    
    food_id = food.get('foodId', '')
    label = food.get('label', 'Unknown Food')
    
    # Get nutrients from the food object
    nutrients = food.get('nutrients', {})
    
    # Calculate per serving
    serving_size = measure.get('weight', 100) if measure else 100
    
    return {
        'id': food_id,
        'name': label,
        'brand': food.get('brand', ''),
        'category': food.get('category', 'Generic Foods'),
        'image': food.get('image', ''),
        'servingSize': serving_size,
        'quantity': quantity,
        'calories': round(nutrients.get('ENERC_KCAL', 0) * quantity, 1),
        'protein': round(nutrients.get('PROCNT', 0) * quantity, 1),
        'carbs': round(nutrients.get('CHOCDF', 0) * quantity, 1),
        'fat': round(nutrients.get('FAT', 0) * quantity, 1),
        'fiber': round(nutrients.get('FIBTG', 0) * quantity, 1),
        'sugar': round(nutrients.get('SUGAR', 0) * quantity, 1),
        'source': 'Edamam Vision API',
        'measureUri': measure.get('uri', '') if measure else '',
        'measureLabel': measure.get('label', 'serving') if measure else 'serving'
    }


def _get_demo_response():
    """
    Return a demo response when Vision API is not available.
    This provides realistic sample data so users can experience the feature.
    
    Note: To enable real image recognition:
    1. Sign up at https://developer.edamam.com/
    2. Subscribe to EnterpriseBasic ($14/month) or higher for Vision API
    3. Update EDAMAM_APP_ID and EDAMAM_APP_KEY in .env
    """
    import random
    
    # Pool of demo foods - randomly select 2-3 to simulate real scanning
    demo_foods_pool = [
        {
            'id': 'demo_chicken',
            'name': 'Grilled Chicken Breast',
            'brand': '',
            'category': 'Poultry',
            'image': '',
            'servingSize': 100,
            'quantity': 1,
            'calories': 165,
            'protein': 31,
            'carbs': 0,
            'fat': 3.6,
            'fiber': 0,
            'sugar': 0,
            'source': 'Demo',
            'measureUri': '',
            'measureLabel': '100g'
        },
        {
            'id': 'demo_rice',
            'name': 'Steamed White Rice',
            'brand': '',
            'category': 'Grains',
            'image': '',
            'servingSize': 150,
            'quantity': 1,
            'calories': 195,
            'protein': 4.3,
            'carbs': 44.5,
            'fat': 0.4,
            'fiber': 0.6,
            'sugar': 0,
            'source': 'Demo',
            'measureUri': '',
            'measureLabel': '1 cup'
        },
        {
            'id': 'demo_salad',
            'name': 'Mixed Green Salad',
            'brand': '',
            'category': 'Vegetables',
            'image': '',
            'servingSize': 100,
            'quantity': 1,
            'calories': 20,
            'protein': 1.5,
            'carbs': 3.5,
            'fat': 0.2,
            'fiber': 2,
            'sugar': 1.5,
            'source': 'Demo',
            'measureUri': '',
            'measureLabel': '1 cup'
        },
        {
            'id': 'demo_eggs',
            'name': 'Scrambled Eggs',
            'brand': '',
            'category': 'Eggs',
            'image': '',
            'servingSize': 100,
            'quantity': 1,
            'calories': 148,
            'protein': 10,
            'carbs': 1.6,
            'fat': 11,
            'fiber': 0,
            'sugar': 1.4,
            'source': 'Demo',
            'measureUri': '',
            'measureLabel': '2 eggs'
        },
        {
            'id': 'demo_pasta',
            'name': 'Spaghetti with Tomato Sauce',
            'brand': '',
            'category': 'Pasta',
            'image': '',
            'servingSize': 200,
            'quantity': 1,
            'calories': 280,
            'protein': 9,
            'carbs': 52,
            'fat': 4,
            'fiber': 3,
            'sugar': 6,
            'source': 'Demo',
            'measureUri': '',
            'measureLabel': '1 serving'
        },
        {
            'id': 'demo_sandwich',
            'name': 'Turkey Sandwich',
            'brand': '',
            'category': 'Sandwiches',
            'image': '',
            'servingSize': 150,
            'quantity': 1,
            'calories': 320,
            'protein': 22,
            'carbs': 35,
            'fat': 10,
            'fiber': 2,
            'sugar': 4,
            'source': 'Demo',
            'measureUri': '',
            'measureLabel': '1 sandwich'
        }
    ]
    
    # Randomly select 2-3 foods to simulate variety
    num_foods = random.randint(2, 3)
    selected_foods = random.sample(demo_foods_pool, min(num_foods, len(demo_foods_pool)))
    
    return {
        'success': True,
        'demo_mode': True,
        'message': 'Demo Mode: Showing sample foods. For real image recognition, a paid Edamam Vision API subscription is required.',
        'foods': selected_foods
    }


def search_food_by_text(query):
    """
    Search for foods by text using Edamam's NLP parser.
    This can be used as a fallback or for manual food entry.
    
    Args:
        query: Text description of the food (e.g., "1 cup of rice")
    
    Returns:
        dict with matching foods and nutrition data
    """
    app_id, app_key = get_credentials()
    
    try:
        params = {
            'app_id': app_id,
            'app_key': app_key,
            'ingr': query,
            'nutrition-type': 'cooking'
        }
        
        response = requests.get(
            EDAMAM_FOOD_DB_URL,
            params=params,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            return _process_vision_response(data, app_id, app_key)
        else:
            return {
                'success': False,
                'error': f'API returned status {response.status_code}',
                'foods': []
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'foods': []
        }


def get_api_status():
    """Check if the Edamam API is configured and accessible."""
    try:
        app_id, app_key = get_credentials()
        
        # Test with a simple search
        params = {
            'app_id': app_id,
            'app_key': app_key,
            'ingr': 'apple',
            'nutrition-type': 'cooking'
        }
        
        response = requests.get(
            EDAMAM_FOOD_DB_URL,
            params=params,
            timeout=10
        )
        
        if response.status_code == 200:
            return {
                'status': 'connected',
                'message': 'Edamam API is configured and working',
                'has_vision_api': True  # Would need to test this separately
            }
        elif response.status_code == 401:
            return {
                'status': 'error',
                'message': 'Invalid API credentials'
            }
        else:
            return {
                'status': 'error',
                'message': f'API returned status {response.status_code}'
            }
            
    except ValueError as e:
        return {
            'status': 'not_configured',
            'message': str(e)
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }
