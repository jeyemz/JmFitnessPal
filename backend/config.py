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
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 86400))  # 24 hours default
    
    # Flask
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # USDA FoodData Central API
    # Get your free API key at: https://fdc.nal.usda.gov/api-key-signup.html
    USDA_FDC_API_KEY = os.getenv('USDA_FDC_API_KEY', '')
    USDA_FDC_BASE_URL = os.getenv('USDA_FDC_BASE_URL', 'https://api.nal.usda.gov/fdc/v1')
    
    # Cache settings (in seconds)
    API_CACHE_TTL = int(os.getenv('API_CACHE_TTL', 3600))  # 1 hour cache for API results
    
    # Edamam Vision API (Food Image Recognition) - optional, replaced by LogMeal
    EDAMAM_APP_ID = os.getenv('EDAMAM_APP_ID', '')
    EDAMAM_APP_KEY = os.getenv('EDAMAM_APP_KEY', '')

    # LogMeal Food AI (Food Image Recognition)
    # Image scan requires an API User token (not API Company). Get it at https://www.logmeal.com/api/users
    LOGMEAL_API_TOKEN = os.getenv('LOGMEAL_API_TOKEN', '')
