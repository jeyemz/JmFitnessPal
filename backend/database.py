import mysql.connector
from mysql.connector import pooling
from config import Config

# Create a connection pool
connection_pool = pooling.MySQLConnectionPool(
    pool_name="jmfitnesspal_pool",
    pool_size=5,
    pool_reset_session=True,
    host=Config.DB_HOST,
    port=Config.DB_PORT,
    user=Config.DB_USER,
    password=Config.DB_PASSWORD,
    database=Config.DB_NAME
)

def get_db_connection():
    """Get a connection from the pool"""
    return connection_pool.get_connection()

def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=False):
    """Execute a database query and return results"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        
        if commit:
            connection.commit()
            result = cursor.lastrowid
        
        return result
    except Exception as e:
        if connection:
            connection.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
    