import os
from dotenv import load_dotenv

# Load .env from parent directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

class Config:
    # Database
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('MYSQL_USER', 'jmfitness_user')
    DB_PASSWORD = os.getenv('MYSQL_PASSWORD', 'jmfitness_pass123')
    DB_NAME = os.getenv('MYSQL_DATABASE', 'jmfitnesspal')
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    
    # Flask
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # API Ninjas
    API_NINJAS_KEY = os.getenv('API_NINJAS_KEY', '')
    API_NINJAS_BASE_URL = os.getenv('API_NINJAS_BASE_URL', 'https://api.api-ninjas.com/v1')
    
    # Cache settings (in seconds)
    API_CACHE_TTL = int(os.getenv('API_CACHE_TTL', 3600))  # 1 hour cache for API results
