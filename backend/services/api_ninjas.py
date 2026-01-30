"""
API Ninjas Nutrition Service
Fetches nutritional data from API Ninjas with caching support
"""

import requests
import time
import hashlib
import json
from functools import lru_cache
from config import Config

# In-memory cache with TTL
_cache = {}
_cache_timestamps = {}


class APIError(Exception):
    """Custom exception for API errors"""
    def __init__(self, message, status_code=None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def _get_cache_key(query):
    """Generate a cache key for a query"""
    return hashlib.md5(query.lower().strip().encode()).hexdigest()


def _is_cache_valid(cache_key):
    """Check if cached data is still valid"""
    if cache_key not in _cache_timestamps:
        return False
    return (time.time() - _cache_timestamps[cache_key]) < Config.API_CACHE_TTL


def _get_from_cache(cache_key):
    """Get data from cache if valid"""
    if _is_cache_valid(cache_key):
        return _cache.get(cache_key)
    return None


def _set_cache(cache_key, data):
    """Store data in cache"""
    _cache[cache_key] = data
    _cache_timestamps[cache_key] = time.time()


def clear_cache():
    """Clear all cached data"""
    global _cache, _cache_timestamps
    _cache = {}
    _cache_timestamps = {}


def get_cache_stats():
    """Get cache statistics for admin monitoring"""
    valid_entries = sum(1 for key in _cache if _is_cache_valid(key))
    return {
        'total_entries': len(_cache),
        'valid_entries': valid_entries,
        'expired_entries': len(_cache) - valid_entries,
        'cache_ttl_seconds': Config.API_CACHE_TTL
    }


def _is_premium_locked(value):
    """Check if a value is locked behind premium subscription"""
    if isinstance(value, str) and 'premium' in value.lower():
        return True
    return False


def _safe_float(value, default=0):
    """Safely convert a value to float"""
    if value is None:
        return default
    # Check if it's a premium-locked field
    if _is_premium_locked(value):
        return None  # Return None to indicate premium-locked
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def _safe_round(value, decimals=1, default=0):
    """Safely round a value, converting to float first if needed"""
    if value is None:
        return None  # Preserve None for premium-locked fields
    try:
        return round(float(value), decimals)
    except (ValueError, TypeError):
        return default


def search_nutrition(query):
    """
    Search for nutritional information using API Ninjas
    
    Args:
        query: Food item or meal description (e.g., "100g chicken breast", "1 apple")
    
    Returns:
        List of food items with nutritional data
    
    Raises:
        APIError: If API call fails
    """
    if not query or len(query.strip()) < 2:
        return []
    
    # Check cache first
    cache_key = _get_cache_key(query)
    cached_data = _get_from_cache(cache_key)
    if cached_data is not None:
        print(f"[Cache HIT] Query: {query}")
        return cached_data
    
    print(f"[Cache MISS] Query: {query}")
    
    # Check if API key is configured
    if not Config.API_NINJAS_KEY:
        raise APIError("API Ninjas key not configured", 500)
    
    try:
        api_url = f"{Config.API_NINJAS_BASE_URL}/nutrition?query={requests.utils.quote(query)}"
        
        print(f"[API Request] URL: {api_url}")
        
        response = requests.get(
            api_url,
            headers={'X-Api-Key': Config.API_NINJAS_KEY},
            timeout=10
        )
        
        print(f"[API Response] Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[API Response] Raw data: {data}")
            
            # Transform API response to our format
            # API Ninjas FREE TIER limits: calories and protein are premium-only
            # We'll estimate calories from available macros: carbs*4 + fat*9 + protein*4
            results = []
            for item in data:
                # Check if premium-locked
                calories_raw = item.get('calories')
                protein_raw = item.get('protein_g') or item.get('protein')
                
                is_premium_calories = _is_premium_locked(calories_raw)
                is_premium_protein = _is_premium_locked(protein_raw)
                
                # Get carbs - available in free tier
                carbs = _safe_float(item.get('carbohydrates_total_g') or item.get('carbohydrates', 0), 0) or 0
                
                # Get fat - available in free tier
                fat = _safe_float(item.get('fat_total_g') or item.get('fat', 0), 0) or 0
                
                # Get protein - may be premium-locked
                if is_premium_protein:
                    protein = 0  # Unknown
                else:
                    protein = _safe_float(protein_raw, 0) or 0
                
                # Get or estimate calories
                if is_premium_calories:
                    # Estimate calories from available macros
                    # Formula: (protein * 4) + (carbs * 4) + (fat * 9)
                    estimated_calories = (protein * 4) + (carbs * 4) + (fat * 9)
                    calories = round(estimated_calories, 1)
                    print(f"[Estimated Calories] protein={protein}*4 + carbs={carbs}*4 + fat={fat}*9 = {calories}")
                else:
                    calories = _safe_float(calories_raw, 0) or 0
                
                # Get other values (available in free tier)
                fiber = _safe_float(item.get('fiber_g') or item.get('fiber', 0), 0) or 0
                sugar = _safe_float(item.get('sugar_g') or item.get('sugar', 0), 0) or 0
                sodium = _safe_float(item.get('sodium_mg') or item.get('sodium', 0), 0) or 0
                serving_size = _safe_float(item.get('serving_size_g') or item.get('serving_size', 100), 100) or 100
                
                print(f"[Parsed] name={item.get('name')}, cal={calories}, protein={protein}, carbs={carbs}, fat={fat}")
                
                results.append({
                    'name': str(item.get('name', 'Unknown')),
                    'calories': round(calories, 1),
                    'serving_size_g': round(serving_size, 1),
                    'fat_total_g': round(fat, 1),
                    'fat_saturated_g': round(_safe_float(item.get('fat_saturated_g') or item.get('saturated_fat', 0), 0) or 0, 1),
                    'protein_g': round(protein, 1),
                    'sodium_mg': round(sodium, 1),
                    'potassium_mg': round(_safe_float(item.get('potassium_mg') or item.get('potassium', 0), 0) or 0, 1),
                    'cholesterol_mg': round(_safe_float(item.get('cholesterol_mg') or item.get('cholesterol', 0), 0) or 0, 1),
                    'carbohydrates_total_g': round(carbs, 1),
                    'fiber_g': round(fiber, 1),
                    'sugar_g': round(sugar, 1),
                    'source': 'api_ninjas',
                    'is_estimated': is_premium_calories or is_premium_protein
                })
            
            # Cache the results
            _set_cache(cache_key, results)
            
            return results
        
        elif response.status_code == 400:
            raise APIError("Invalid query. Please try a different search term.", 400)
        
        elif response.status_code == 401:
            raise APIError("API authentication failed. Please check API key.", 401)
        
        elif response.status_code == 429:
            raise APIError("API rate limit exceeded. Please try again later.", 429)
        
        elif response.status_code == 404:
            # Return empty list for not found
            _set_cache(cache_key, [])
            return []
        
        else:
            raise APIError(f"API error: {response.status_code}", response.status_code)
    
    except APIError:
        raise
    
    except requests.exceptions.Timeout:
        raise APIError("Request timed out. Please try again.", 408)
    
    except requests.exceptions.ConnectionError:
        raise APIError("Unable to connect to nutrition API. Please check your connection.", 503)
    
    except requests.exceptions.RequestException as e:
        raise APIError(f"Request failed: {str(e)}", 500)
    
    except Exception as e:
        print(f"[API Error] Unexpected error: {e}")
        raise APIError(f"Unexpected error: {str(e)}", 500)


def calculate_nutrition(food_data, custom_amount_g):
    """
    Calculate nutritional values based on custom amount
    
    Args:
        food_data: Food item data from API
        custom_amount_g: Custom amount in grams
    
    Returns:
        Calculated nutritional values
    """
    if not food_data or custom_amount_g <= 0:
        return None
    
    # Get base serving size
    base_serving = food_data.get('serving_size_g') or food_data.get('servingSize') or 100
    try:
        base_serving = float(base_serving)
    except (ValueError, TypeError):
        base_serving = 100
    
    if base_serving <= 0:
        base_serving = 100
    
    multiplier = custom_amount_g / base_serving
    
    # Helper to safely get and multiply values
    def get_val(key, alt_key=None, default=0):
        val = food_data.get(key)
        if val is None and alt_key:
            val = food_data.get(alt_key)
        if val is None:
            return default
        try:
            return round(float(val) * multiplier, 1)
        except (ValueError, TypeError):
            return default
    
    return {
        'name': str(food_data.get('name', 'Unknown')),
        'amount_g': custom_amount_g,
        'base_serving_g': base_serving,
        'calories': get_val('calories'),
        'protein_g': get_val('protein_g', 'protein'),
        'carbohydrates_g': get_val('carbohydrates_total_g', 'carbs'),
        'fat_g': get_val('fat_total_g', 'fat'),
        'fiber_g': get_val('fiber_g', 'fiber'),
        'sugar_g': get_val('sugar_g', 'sugar'),
        'sodium_mg': get_val('sodium_mg', 'sodium'),
        'fat_saturated_g': get_val('fat_saturated_g', 'saturatedFat'),
        'cholesterol_mg': get_val('cholesterol_mg', 'cholesterol'),
        'potassium_mg': get_val('potassium_mg', 'potassium'),
        'source': 'api_ninjas'
    }


def convert_to_grams(amount, unit):
    """
    Convert various units to grams
    
    Args:
        amount: Numeric amount
        unit: Unit of measurement
    
    Returns:
        Amount in grams
    """
    unit = unit.lower().strip()
    
    conversions = {
        'g': 1,
        'gram': 1,
        'grams': 1,
        'kg': 1000,
        'kilogram': 1000,
        'kilograms': 1000,
        'oz': 28.3495,
        'ounce': 28.3495,
        'ounces': 28.3495,
        'lb': 453.592,
        'lbs': 453.592,
        'pound': 453.592,
        'pounds': 453.592,
        'cup': 240,  # Approximate for liquids/solids
        'cups': 240,
        'tbsp': 15,
        'tablespoon': 15,
        'tablespoons': 15,
        'tsp': 5,
        'teaspoon': 5,
        'teaspoons': 5,
        'ml': 1,  # Approximate (water density)
        'milliliter': 1,
        'milliliters': 1,
        'l': 1000,
        'liter': 1000,
        'liters': 1000,
    }
    
    return amount * conversions.get(unit, 1)
