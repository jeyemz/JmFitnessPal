"""
USDA FoodData Central Nutrition Service
Fetches nutritional data from USDA FoodData Central API with caching support
API Documentation: https://fdc.nal.usda.gov/api-guide.html
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

# USDA FDC Nutrient IDs for the nutrients we care about
NUTRIENT_IDS = {
    'energy': 1008,           # Calories (kcal)
    'protein': 1003,          # Protein (g)
    'carbohydrates': 1005,    # Carbohydrate, by difference (g)
    'fat': 1004,              # Total lipid (fat) (g)
    'saturated_fat': 1258,    # Fatty acids, total saturated (g)
    'fiber': 1079,            # Fiber, total dietary (g)
    'sugar': 2000,            # Sugars, total including NLEA (g)
    'sodium': 1093,           # Sodium, Na (mg)
    'cholesterol': 1253,      # Cholesterol (mg)
    'potassium': 1092,        # Potassium, K (mg)
}


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


def _safe_float(value, default=0):
    """Safely convert a value to float"""
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def _safe_round(value, decimals=1, default=0):
    """Safely round a value, converting to float first if needed"""
    if value is None:
        return default
    try:
        return round(float(value), decimals)
    except (ValueError, TypeError):
        return default


def _extract_nutrient(food_nutrients, nutrient_id, default=0):
    """
    Extract a specific nutrient value from the food nutrients list
    
    Args:
        food_nutrients: List of nutrient objects from USDA API
        nutrient_id: The USDA nutrient ID to look for
        default: Default value if nutrient not found
    
    Returns:
        The nutrient value or default
    """
    for nutrient in food_nutrients:
        # Handle different response formats (search vs detail endpoints)
        nid = nutrient.get('nutrientId')
        if nid is None:
            # Try nested format (used in detail endpoint)
            nid = nutrient.get('nutrient', {}).get('id')
        
        if nid == nutrient_id:
            # Get value - try 'value' first, then 'amount' (0 is valid!)
            val = nutrient.get('value')
            if val is None:
                val = nutrient.get('amount')
            return _safe_float(val, default)
    return default


def _get_serving_size(food_item):
    """
    Extract serving size from food item
    USDA API provides serving size in different ways depending on food type
    """
    # Try to get serving size from food measures
    if 'foodMeasures' in food_item and food_item['foodMeasures']:
        measure = food_item['foodMeasures'][0]
        gram_weight = measure.get('gramWeight')
        if gram_weight:
            return _safe_float(gram_weight, 100)
    
    # Try servingSize field (branded foods)
    if 'servingSize' in food_item:
        return _safe_float(food_item['servingSize'], 100)
    
    # Try householdServingFullText
    if 'householdServingFullText' in food_item:
        # This is typically text like "1 cup" - default to 100g
        return 100
    
    # Default to 100g (standard USDA reference amount)
    return 100


def search_nutrition(query):
    """
    Search for nutritional information using USDA FoodData Central
    
    Args:
        query: Food item or meal description (e.g., "chicken breast", "apple")
    
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
    if not Config.USDA_FDC_API_KEY:
        raise APIError("USDA FoodData Central API key not configured", 500)
    
    try:
        api_url = f"{Config.USDA_FDC_BASE_URL}/foods/search"
        
        # USDA API request body
        request_body = {
            "query": query,
            "pageSize": 25,
            "pageNumber": 1,
            "sortBy": "dataType.keyword",
            "sortOrder": "asc",
            # Prioritize Foundation and SR Legacy foods for accuracy
            "dataType": ["Foundation", "SR Legacy", "Branded"]
        }
        
        print(f"[API Request] URL: {api_url}")
        print(f"[API Request] Query: {query}")
        
        response = requests.post(
            api_url,
            json=request_body,
            params={'api_key': Config.USDA_FDC_API_KEY},
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        print(f"[API Response] Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            foods = data.get('foods', [])
            
            print(f"[API Response] Found {len(foods)} foods")
            
            # Transform API response to our format
            results = []
            for item in foods[:20]:  # Limit to top 20 results
                food_nutrients = item.get('foodNutrients', [])
                
                # Extract nutrients using USDA nutrient IDs
                calories = _extract_nutrient(food_nutrients, NUTRIENT_IDS['energy'])
                protein = _extract_nutrient(food_nutrients, NUTRIENT_IDS['protein'])
                carbs = _extract_nutrient(food_nutrients, NUTRIENT_IDS['carbohydrates'])
                fat = _extract_nutrient(food_nutrients, NUTRIENT_IDS['fat'])
                saturated_fat = _extract_nutrient(food_nutrients, NUTRIENT_IDS['saturated_fat'])
                fiber = _extract_nutrient(food_nutrients, NUTRIENT_IDS['fiber'])
                sugar = _extract_nutrient(food_nutrients, NUTRIENT_IDS['sugar'])
                sodium = _extract_nutrient(food_nutrients, NUTRIENT_IDS['sodium'])
                cholesterol = _extract_nutrient(food_nutrients, NUTRIENT_IDS['cholesterol'])
                potassium = _extract_nutrient(food_nutrients, NUTRIENT_IDS['potassium'])
                
                # Get serving size
                serving_size = _get_serving_size(item)
                
                # Build food name (include brand for branded foods)
                food_name = item.get('description', 'Unknown')
                brand_name = item.get('brandName') or item.get('brandOwner')
                if brand_name:
                    food_name = f"{food_name} ({brand_name})"
                
                # Get FDC ID for potential future lookups
                fdc_id = item.get('fdcId')
                
                print(f"[Parsed] name={food_name[:50]}, cal={calories}, protein={protein}, carbs={carbs}, fat={fat}")
                
                results.append({
                    'name': food_name,
                    'fdc_id': fdc_id,
                    'calories': _safe_round(calories),
                    'serving_size_g': _safe_round(serving_size),
                    'fat_total_g': _safe_round(fat),
                    'fat_saturated_g': _safe_round(saturated_fat),
                    'protein_g': _safe_round(protein),
                    'sodium_mg': _safe_round(sodium),
                    'potassium_mg': _safe_round(potassium),
                    'cholesterol_mg': _safe_round(cholesterol),
                    'carbohydrates_total_g': _safe_round(carbs),
                    'fiber_g': _safe_round(fiber),
                    'sugar_g': _safe_round(sugar),
                    'source': 'usda_fdc',
                    'data_type': item.get('dataType', 'Unknown'),
                    'is_estimated': False
                })
            
            # Cache the results
            _set_cache(cache_key, results)
            
            return results
        
        elif response.status_code == 400:
            error_data = response.json() if response.text else {}
            error_msg = error_data.get('error', {}).get('message', 'Invalid query')
            raise APIError(f"Invalid query: {error_msg}", 400)
        
        elif response.status_code == 401 or response.status_code == 403:
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
        raise APIError("Unable to connect to USDA nutrition API. Please check your connection.", 503)
    
    except requests.exceptions.RequestException as e:
        raise APIError(f"Request failed: {str(e)}", 500)
    
    except Exception as e:
        print(f"[API Error] Unexpected error: {e}")
        raise APIError(f"Unexpected error: {str(e)}", 500)


def get_food_details(fdc_id):
    """
    Get detailed nutritional information for a specific food by FDC ID
    
    Args:
        fdc_id: The USDA FoodData Central ID
    
    Returns:
        Detailed food item with nutritional data
    
    Raises:
        APIError: If API call fails
    """
    if not fdc_id:
        raise APIError("FDC ID is required", 400)
    
    # Check cache
    cache_key = f"fdc_detail_{fdc_id}"
    cached_data = _get_from_cache(cache_key)
    if cached_data is not None:
        print(f"[Cache HIT] FDC ID: {fdc_id}")
        return cached_data
    
    if not Config.USDA_FDC_API_KEY:
        raise APIError("USDA FoodData Central API key not configured", 500)
    
    try:
        api_url = f"{Config.USDA_FDC_BASE_URL}/food/{fdc_id}"
        
        response = requests.get(
            api_url,
            params={'api_key': Config.USDA_FDC_API_KEY},
            timeout=15
        )
        
        if response.status_code == 200:
            item = response.json()
            food_nutrients = item.get('foodNutrients', [])
            
            # Extract nutrients
            result = {
                'name': item.get('description', 'Unknown'),
                'fdc_id': fdc_id,
                'calories': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['energy'])),
                'serving_size_g': _safe_round(_get_serving_size(item)),
                'fat_total_g': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['fat'])),
                'fat_saturated_g': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['saturated_fat'])),
                'protein_g': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['protein'])),
                'sodium_mg': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['sodium'])),
                'potassium_mg': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['potassium'])),
                'cholesterol_mg': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['cholesterol'])),
                'carbohydrates_total_g': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['carbohydrates'])),
                'fiber_g': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['fiber'])),
                'sugar_g': _safe_round(_extract_nutrient(food_nutrients, NUTRIENT_IDS['sugar'])),
                'source': 'usda_fdc',
                'data_type': item.get('dataType', 'Unknown'),
                'brand_name': item.get('brandName') or item.get('brandOwner'),
                'is_estimated': False
            }
            
            _set_cache(cache_key, result)
            return result
        
        elif response.status_code == 404:
            raise APIError("Food not found", 404)
        
        else:
            raise APIError(f"API error: {response.status_code}", response.status_code)
    
    except APIError:
        raise
    except Exception as e:
        print(f"[API Error] Get food details error: {e}")
        raise APIError(f"Failed to get food details: {str(e)}", 500)


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
    
    # Get base serving size (USDA data is typically per 100g)
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
        'source': 'usda_fdc'
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
