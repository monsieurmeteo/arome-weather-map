import time
import requests
import json

supabase_url = "https://ubdevaemtwbzxksjlhjg.supabase.co"
anon_key = "sb_publishable_1qhA0xAnNSd3VxpoLdxYrQ_yUemEhaP"

headers = {
    "apikey": anon_key,
    "Authorization": f"Bearer {anon_key}",
    "Content-Type": "application/json"
}

# 1. Tester la connexion et le volume de la table lightning_strikes
def check_row_count():
    url = f"{supabase_url}/rest/v1/lightning_strikes?select=count"
    headers_count = {**headers, "Prefer": "count=exact"}
    start = time.time()
    try:
        res = requests.get(url, headers=headers_count, timeout=10)
        elapsed = time.time() - start
        content_range = res.headers.get("Content-Range", "unknown")
        print(f"Row count response: status={res.status_code}, time={elapsed:.3f}s, range={content_range}")
    except Exception as e:
        print(f"Count error: {e}")

# 2. Mesurer le temps d'une requête historique typique
def test_historical_query(date_str):
    url = f"{supabase_url}/rest/v1/lightning_strikes?select=lat,lon,strike_time&strike_time=gte.{date_str}T00:00:00Z&strike_time=lte.{date_str}T23:59:59Z"
    start = time.time()
    try:
        res = requests.get(url, headers=headers, timeout=10)
        elapsed = time.time() - start
        if res.status_code == 200:
            data = res.json()
            size_kb = len(res.content) / 1024
            print(f"Historical query ({date_str}): status=200, time={elapsed:.3f}s, strikes={len(data)}, size={size_kb:.2f} KB")
        else:
            print(f"Historical query failed: status={res.status_code}, time={elapsed:.3f}s, body={res.text[:100]}")
    except Exception as e:
        print(f"Query error: {e}")

print("=== Supabase Connection and Metrics ===")
check_row_count()

print("\n=== Testing Historical Query for Today's Range ===")
test_historical_query("2026-07-25")

print("\n=== Testing Historical Query for Past Day (2026-07-20) ===")
test_historical_query("2026-07-20")
