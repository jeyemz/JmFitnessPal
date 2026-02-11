#!/usr/bin/env python3
"""
Remove duplicate or all user-added foods from the Local Database.
Run from project root: python backend/cleanup_local_foods.py
  - Default: removes duplicates (keeps one per food name)
  - --wipe-all: removes ALL user-added foods
"""
import os
import sys

# Add parent dir for .env and config
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

import mysql.connector

def get_config():
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'user': os.getenv('MYSQL_USER', 'jmfitness_user'),
        'password': os.getenv('MYSQL_PASSWORD', 'jmfitness_pass123'),
        'database': os.getenv('MYSQL_DATABASE', 'jmfitnesspal'),
    }

def main():
    wipe_all = '--wipe-all' in sys.argv

    try:
        conn = mysql.connector.connect(**get_config())
        cursor = conn.cursor()

        if wipe_all:
            cursor.execute("DELETE FROM foods WHERE source = 'user'")
            removed = cursor.rowcount
            conn.commit()
            print(f"Removed all {removed} user-added food(s). Local database is now empty.")
        else:
            # Remove duplicates: keep row with smallest food_id per food name
            cursor.execute("""
                DELETE f1 FROM foods f1
                INNER JOIN foods f2
                  ON LOWER(TRIM(f1.food_name)) = LOWER(TRIM(f2.food_name))
                 AND f1.source = 'user'
                 AND f2.source = 'user'
                 AND f1.food_id > f2.food_id
            """)
            removed = cursor.rowcount
            conn.commit()
            print(f"Removed {removed} duplicate food(s).")

        cursor.close()
        conn.close()
    except mysql.connector.Error as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
