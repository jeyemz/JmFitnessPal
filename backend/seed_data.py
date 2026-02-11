"""
Seed script to create admin account and sample food data
Run this after the database is set up
"""

import bcrypt
import mysql.connector
from config import Config

def get_connection():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )

def create_admin_account():
    """Create admin account with specified credentials"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if admin already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s", ('randomexg@gmail.com',))
        existing = cursor.fetchone()
        
        if existing:
            print("Admin account already exists!")
            return existing['user_id']
        
        # Hash password
        password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create admin user (role_id 1 = admin)
        cursor.execute(
            """INSERT INTO users (email, password_hash, first_name, last_name, nickname, role_id, is_active, is_verified)
               VALUES (%s, %s, %s, %s, %s, 1, TRUE, TRUE)""",
            ('randomexg@gmail.com', password_hash, 'Admin', 'User', 'Admin')
        )
        conn.commit()
        admin_id = cursor.lastrowid
        
        # Create admin profile
        cursor.execute(
            """INSERT INTO user_profiles (user_id, profile_picture_url)
               VALUES (%s, %s)""",
            (admin_id, 'https://ui-avatars.com/api/?name=Admin+User&background=dc2626&color=fff')
        )
        conn.commit()
        
        print(f"Admin account created successfully!")
        print(f"  Email: randomexg@gmail.com")
        print(f"  Password: admin123")
        print(f"  User ID: {admin_id}")
        
        return admin_id
        
    except Exception as e:
        print(f"Error creating admin: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def seed_food_data():
    """Seed sample food data"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    foods = [
        # Breakfast items
        ('Greek Yogurt', 'Fage', 1, 170, 'g', 100, 10, 6, 0.7, 4, 0, 65),
        ('Scrambled Eggs', None, 4, 100, 'g', 148, 10, 1, 11, 0, 1, 140),
        ('Oatmeal', 'Quaker', 3, 40, 'g', 150, 5, 27, 3, 4, 1, 0),
        ('Banana', None, 1, 118, 'g', 105, 1.3, 27, 0.4, 3.1, 14, 1),
        ('Whole Wheat Toast', 'Nature\'s Own', 3, 43, 'g', 110, 4, 20, 1.5, 3, 3, 170),
        ('Blueberries', None, 1, 100, 'g', 57, 0.7, 14, 0.3, 2.4, 10, 1),
        
        # Lunch items
        ('Grilled Chicken Breast', None, 4, 100, 'g', 165, 31, 0, 3.6, 0, 0, 74),
        ('Brown Rice', None, 3, 100, 'g', 112, 2.6, 24, 0.9, 1.8, 0.4, 1),
        ('Caesar Salad', None, 2, 200, 'g', 190, 8, 8, 15, 3, 3, 470),
        ('Turkey Sandwich', 'Subway', 3, 230, 'g', 280, 18, 45, 4.5, 5, 6, 1000),
        ('Chicken Wrap', None, 4, 250, 'g', 350, 25, 35, 12, 3, 4, 800),
        ('Quinoa Bowl', None, 3, 185, 'g', 222, 8, 39, 4, 5, 0, 13),
        
        # Dinner items
        ('Salmon Fillet', None, 4, 100, 'g', 208, 20, 0, 13, 0, 0, 59),
        ('Sirloin Steak', None, 4, 100, 'g', 271, 26, 0, 18, 0, 0, 54),
        ('Pasta with Marinara', None, 3, 200, 'g', 320, 11, 60, 4, 4, 8, 480),
        ('Grilled Vegetables', None, 2, 150, 'g', 75, 3, 15, 1, 4, 6, 25),
        ('Baked Potato', None, 2, 173, 'g', 161, 4.3, 37, 0.2, 3.8, 1.7, 17),
        ('Tofu Stir Fry', None, 4, 200, 'g', 250, 18, 15, 14, 3, 4, 650),
        
        # Snacks
        ('Protein Bar', 'Quest', 7, 60, 'g', 200, 21, 22, 8, 14, 1, 280),
        ('Apple', None, 1, 182, 'g', 95, 0.5, 25, 0.3, 4.4, 19, 2),
        ('Almonds', None, 7, 28, 'g', 164, 6, 6, 14, 3.5, 1, 0),
        ('Protein Shake', 'Optimum Nutrition', 6, 330, 'ml', 120, 24, 3, 1, 0, 1, 100),
        ('Mixed Nuts', 'Planters', 7, 30, 'g', 180, 5, 6, 16, 2, 1, 55),
        ('Greek Yogurt & Blueberries', None, 1, 200, 'g', 150, 12, 18, 3, 2, 12, 50),
        
        # Beverages
        ('Orange Juice', 'Tropicana', 6, 240, 'ml', 110, 2, 26, 0, 0, 22, 0),
        ('Coffee with Milk', None, 6, 240, 'ml', 30, 2, 3, 1, 0, 3, 40),
        ('Green Smoothie', None, 6, 350, 'ml', 180, 4, 35, 3, 5, 20, 80),
        
        # Fast Food
        ('Cheeseburger', 'McDonald\'s', 9, 119, 'g', 300, 15, 33, 12, 2, 7, 680),
        ('French Fries (Medium)', 'McDonald\'s', 9, 117, 'g', 320, 4, 43, 15, 4, 0, 260),
        ('Pizza Slice (Cheese)', 'Domino\'s', 9, 107, 'g', 285, 12, 36, 10, 2, 4, 640),
        
        # Desserts
        ('Chocolate Chip Cookie', None, 8, 30, 'g', 148, 2, 20, 7, 1, 11, 95),
        ('Ice Cream (Vanilla)', 'Häagen-Dazs', 8, 100, 'g', 207, 4, 24, 11, 0, 21, 53),
        ('Dark Chocolate', 'Lindt', 8, 40, 'g', 228, 3, 20, 16, 4, 12, 5),
    ]
    
    try:
        # Check if foods already exist
        cursor.execute("SELECT COUNT(*) as count FROM foods")
        count = cursor.fetchone()['count']
        
        if count > 0:
            print(f"Food database already has {count} items. Skipping seed.")
            return
        
        for food in foods:
            cursor.execute(
                """INSERT INTO foods (food_name, brand_name, category_id, serving_size, serving_unit,
                                       calories_per_serving, protein_g, carbohydrates_g, fat_g, 
                                       fiber_g, sugar_g, sodium_mg, source, status, is_active)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'system', 'approved', TRUE)""",
                food
            )
        
        conn.commit()
        print(f"Successfully seeded {len(foods)} food items!")
        
    except Exception as e:
        print(f"Error seeding food data: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def main():
    print("=" * 50)
    print("JmFitnessPal Database Seeding")
    print("=" * 50)
    print()
    
    print("1. Creating Admin Account...")
    create_admin_account()
    print()
    
    print("2. Seeding Food Database...")
    seed_food_data()
    print()
    
    print("=" * 50)
    print("Seeding complete!")
    print("=" * 50)

if __name__ == '__main__':
    main()
