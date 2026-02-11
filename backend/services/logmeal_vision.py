"""
LogMeal Food AI Service
Food image recognition and nutritional analysis using LogMeal API.
Docs: https://docs.logmeal.com/
"""

import requests
import base64
from config import Config

LOGMEAL_BASE_URL = "https://api.logmeal.com"


def get_token():
    """Get LogMeal API token (API Company or API User token)."""
    token = getattr(Config, 'LOGMEAL_API_TOKEN', None) or getattr(Config, 'LOGMEAL_TOKEN', '')
    if not token:
        raise ValueError("LogMeal API token not configured. Set LOGMEAL_API_TOKEN in .env")
    return token.strip()


def analyze_food_image(image_data, image_type='base64', return_debug=False):
    """
    Analyze a food image using LogMeal API.
    Flow: 1) Upload image -> get imageId  2) Get nutritional info for imageId.

    Args:
        image_data: Base64 encoded image data (or data URL with comma prefix)
        image_type: 'base64' or 'file'
        return_debug: If True, include raw seg_data and nutr_data in result (to verify API response)

    Returns:
        dict with success, foods (list of {name, calories, protein, carbs, fat, ...}), error
        and optionally debug: {segmentation, nutrition} when return_debug=True
    """
    try:
        token = get_token()
    except ValueError as e:
        return {'success': False, 'error': str(e), 'foods': []}

    try:
        if image_type == 'base64':
            if not image_data or not isinstance(image_data, (str, bytes)):
                return {'success': False, 'error': 'Invalid image data.', 'foods': []}
            if ',' in image_data:
                image_data = image_data.split(',', 1)[1]
            try:
                image_bytes = base64.b64decode(image_data)
            except Exception as e:
                return {'success': False, 'error': 'Invalid image format. Please use a valid image file.', 'foods': []}
            if not image_bytes or len(image_bytes) < 100:
                return {'success': False, 'error': 'Image too small or empty.', 'foods': []}
        else:
            with open(image_data, 'rb') as f:
                image_bytes = f.read()

        headers = {
            'Authorization': f'Bearer {token}',
        }

        # Step 1: Upload image and get segmentation (imageId + dish candidates)
        files = {'image': ('food.jpg', image_bytes, 'image/jpeg')}
        seg_url = f'{LOGMEAL_BASE_URL}/v2/image/segmentation/complete'
        seg_resp = requests.post(seg_url, headers=headers, files=files, timeout=30)

        if seg_resp.status_code == 401:
            return {
                'success': False,
                'error': 'Invalid LogMeal API token. Image scan requires an API User token (not the API Company token). Get an API User token at https://www.logmeal.com/api/users and set LOGMEAL_API_TOKEN in .env',
                'foods': []
            }
        if seg_resp.status_code == 403:
            return {
                'success': False,
                'error': 'LogMeal access denied. Image recognition may require an API User token (create one in LogMeal dashboard under Users).',
                'foods': []
            }
        if seg_resp.status_code == 429:
            return {
                'success': False,
                'error': 'LogMeal rate limit reached. Try again later.',
                'foods': []
            }
        if seg_resp.status_code != 200:
            err_text = seg_resp.text[:200] if seg_resp.text else seg_resp.reason
            return {
                'success': False,
                'error': f'LogMeal recognition failed ({seg_resp.status_code}): {err_text}',
                'foods': []
            }

        seg_data = seg_resp.json()
        image_id = seg_data.get('imageId') or seg_data.get('image_id')
        if not image_id:
            return {
                'success': False,
                'error': 'LogMeal did not return an image ID.',
                'foods': []
            }

        # Step 2: Get nutritional info for this image
        nutr_headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        }
        nutr_url = f'{LOGMEAL_BASE_URL}/v2/nutrition/recipe/nutritionalInfo'
        nutr_resp = requests.post(
            nutr_url,
            headers=nutr_headers,
            json={'imageId': image_id},
            timeout=30
        )

        if nutr_resp.status_code != 200:
            err_text = nutr_resp.text[:200] if nutr_resp.text else nutr_resp.reason
            # If we have segmentation, we can still return dish names with placeholder nutrition
            out = _build_result_from_segmentation_only(seg_data, err_text)
            if return_debug:
                out['debug'] = {'segmentation': seg_data, 'nutrition_error': err_text}
            return out

        nutr_data = nutr_resp.json()
        parsed = _parse_nutrition_response(seg_data, nutr_data)
        if return_debug:
            parsed['debug'] = {
                'segmentation': seg_data,
                'nutrition': nutr_data,
            }
        return parsed

    except requests.exceptions.Timeout:
        return {'success': False, 'error': 'Request timed out. Please try again.', 'foods': []}
    except requests.exceptions.RequestException as e:
        return {'success': False, 'error': f'Network error: {str(e)}', 'foods': []}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': f'Error analyzing image: {str(e)}', 'foods': []}


def _get_segmentation_dish_name(seg_data, index=0):
    """Extract dish name from segmentation response; try multiple key shapes."""
    seg_results = (
        seg_data.get('segmentation_results')
        or seg_data.get('segmentationResults')
        or []
    )
    if not seg_results or index >= len(seg_results):
        return None
    region = seg_results[index]
    # LogMeal uses recognition_results (list of { name, id, prob, ... }) per segment
    recognition = region.get('recognition_results') or region.get('recognitionResults') or []
    if recognition:
        first = recognition[0]
        if isinstance(first, dict) and first.get('name'):
            return first.get('name')
    # Fallback: dish_candidates style
    candidates = (
        region.get('dish_candidates')
        or region.get('dishCandidates')
        or region.get('dishes')
        or region.get('predictions')
        or []
    )
    if not candidates:
        return None
    first = candidates[0]
    return (
        first.get('name')
        or first.get('dishName')
        or first.get('food_name')
        or first.get('foodName')
        or (first.get('label') if isinstance(first.get('label'), str) else None)
    )


def _get_nutr_val(obj, *keys, default=0):
    """Get numeric value from nutrition object; also check totalNutrients.{key}.quantity (LogMeal format)."""
    # Direct keys
    for k in keys:
        if isinstance(obj, dict) and k in obj:
            v = obj[k]
            if v is not None:
                try:
                    return float(v)
                except (TypeError, ValueError):
                    pass
        if isinstance(obj, dict) and 'value' in obj:
            try:
                return float(obj['value'])
            except (TypeError, ValueError):
                pass
    # LogMeal: nutritional_info.totalNutrients.ENERC_KCAL.quantity etc.
    total_nutrients = obj.get('totalNutrients') if isinstance(obj, dict) else None
    if total_nutrients:
        for k in keys:
            entry = total_nutrients.get(k) if isinstance(total_nutrients, dict) else None
            if isinstance(entry, dict) and 'quantity' in entry:
                try:
                    return float(entry['quantity'])
                except (TypeError, ValueError):
                    pass
    return default


def _parse_nutrition_response(seg_data, nutr_data):
    """Build list of foods from LogMeal segmentation + nutrition response."""
    foods = []
    # Per-item nutrition (when segmentation was used)
    per_item = nutr_data.get('nutritional_info_per_item') or nutr_data.get('nutritionalInfoPerItem') or []
    # Aggregate nutrition
    total_nutr = nutr_data.get('nutritional_info') or nutr_data.get('nutritionalInfo') or nutr_data.get('nutrition') or {}
    # LogMeal returns foodName (array) or foodNames
    food_name_list = nutr_data.get('foodNames') or nutr_data.get('food_names')
    if food_name_list is None and 'foodName' in nutr_data:
        food_name_list = nutr_data['foodName']
    if not isinstance(food_name_list, list):
        food_name_list = [food_name_list] if food_name_list else []

    def get_val(obj, *keys, default=0):
        return _get_nutr_val(obj, *keys, default=default)

    # Prefer per-item breakdown
    if per_item:
        for i, item in enumerate(per_item):
            name = 'Unknown'
            if isinstance(item, dict):
                name = (
                    item.get('name')
                    or item.get('foodName')
                    or item.get('food_name')
                    or (food_name_list[i] if i < len(food_name_list) else None)
                    or _get_segmentation_dish_name(seg_data, i)
                    or name
                )
                ni = item.get('nutritional_info') or item.get('nutritionalInfo') or item
            else:
                ni = {}
            cal = get_val(ni, 'energy', 'energyKcal', 'calories', 'ENERGY_KCAL', 'ENERC_KCAL')
            prot = get_val(ni, 'protein', 'PROTEIN', 'proteinG', 'PROCNT', 'protein_g')
            carb = get_val(ni, 'carbohydrates', 'carbs', 'CHOCDF', 'carbohydratesG', 'carbohydrates_g')
            fat = get_val(ni, 'fat', 'FAT', 'fatG', 'fat_g')
            foods.append({
                'id': f'logmeal_{i}',
                'name': name,
                'calories': round(cal, 1),
                'protein': round(prot, 1),
                'carbs': round(carb, 1),
                'fat': round(fat, 1),
                'fiber': round(get_val(ni, 'fiber', 'FIBTG', 'fiberG'), 1),
                'sugar': round(get_val(ni, 'sugar', 'SUGAR', 'sugarG'), 1),
                'servingSize': 100,
                'quantity': 1,
                'source': 'LogMeal',
                'measureLabel': 'serving',
            })
    else:
        # Single aggregated meal
        cal = get_val(total_nutr, 'energy', 'energyKcal', 'calories', 'ENERGY_KCAL', 'ENERC_KCAL')
        prot = get_val(total_nutr, 'protein', 'PROTEIN', 'proteinG', 'PROCNT', 'protein_g')
        carb = get_val(total_nutr, 'carbohydrates', 'carbs', 'CHOCDF', 'carbohydratesG', 'carbohydrates_g')
        fat = get_val(total_nutr, 'fat', 'FAT', 'fatG', 'fat_g')
        name = (food_name_list[0] if food_name_list else None) or _get_segmentation_dish_name(seg_data, 0) or 'Recognized meal'
        foods.append({
            'id': 'logmeal_0',
            'name': name or 'Recognized meal',
            'calories': round(cal, 1),
            'protein': round(prot, 1),
            'carbs': round(carb, 1),
            'fat': round(fat, 1),
            'fiber': round(get_val(total_nutr, 'fiber', 'FIBTG', 'fiberG'), 1),
            'sugar': round(get_val(total_nutr, 'sugar', 'SUGAR', 'sugarG'), 1),
            'servingSize': 100,
            'quantity': 1,
            'source': 'LogMeal',
            'measureLabel': 'serving',
        })

    return {
        'success': True,
        'foods': foods,
        'message': f'Found {len(foods)} item(s)' if foods else 'No items recognized',
    }


def _build_result_from_segmentation_only(seg_data, nutrition_error_msg):
    """When nutrition endpoint fails, still return dish names with zero nutrition."""
    foods = []
    seg_results = seg_data.get('segmentation_results') or seg_data.get('segmentationResults') or []
    for i, region in enumerate(seg_results):
        candidates = region.get('dish_candidates') or region.get('dishCandidates') or []
        if candidates:
            name = candidates[0].get('name') or candidates[0].get('dishName') or 'Unknown'
            foods.append({
                'id': f'logmeal_{i}',
                'name': name,
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fat': 0,
                'fiber': 0,
                'sugar': 0,
                'servingSize': 100,
                'quantity': 1,
                'source': 'LogMeal',
                'measureLabel': 'serving',
            })
    if not foods:
        return {
            'success': False,
            'error': nutrition_error_msg or 'Could not get nutrition for image.',
            'foods': [],
        }
    return {
        'success': True,
        'foods': foods,
        'message': 'Recognition succeeded but nutrition unavailable. You can still add and edit values.',
    }


def get_api_status():
    """Check if LogMeal token is configured (no network call)."""
    try:
        token = get_token()
        return {
            'status': 'configured',
            'message': 'LogMeal API token is set.',
        }
    except ValueError as e:
        return {'status': 'not_configured', 'message': str(e)}
