import time
import requests
import json

def measure_api(minutes):
    url = f"https://meteo-npdc.fr/api/v2/lightning/get_latest?minutes={minutes}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": ""
    }
    
    start_time = time.time()
    try:
        response = requests.get(url, headers=headers, timeout=15)
        elapsed = time.time() - start_time
        status_code = response.status_code
        content_length = len(response.content)
        
        try:
            data = response.json()
            is_success = data.get("success", False)
            strikes_count = len(data.get("data", [])) if is_success else 0
        except Exception:
            is_success = False
            strikes_count = 0
            
        print(json.dumps({
            "status_code": status_code,
            "time_seconds": elapsed,
            "size_kb": round(content_length / 1024, 2),
            "success": is_success,
            "strikes_count": strikes_count
        }, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))

print("=== Measuring 360 minutes (6h) ===")
measure_api(360)

print("\n=== Measuring 1440 minutes (24h) ===")
measure_api(1440)
