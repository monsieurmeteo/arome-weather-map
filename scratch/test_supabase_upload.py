import urllib.request
import urllib.error
import json
import os

# Load .env.local
supabase_url = None
supabase_key = None

if os.path.exists('.env.local'):
    with open('.env.local', 'r') as f:
        for line in f:
            if '=' in line:
                k, v = line.strip().split('=', 1)
                if k == 'VITE_SUPABASE_URL' or k == 'SUPABASE_URL':
                    supabase_url = v.strip('"\'')
                elif k == 'SUPABASE_SERVICE_ROLE_KEY' or k == 'VITE_SUPABASE_SERVICE_ROLE_KEY':
                    supabase_key = v.strip('"\'')

print("URL:", supabase_url)
print("Key exists:", supabase_key is not None)

if supabase_url and supabase_key:
    # Test uploading a small JSON file
    test_data = json.dumps({"test": "hello"}).encode('utf-8')
    url = f"{supabase_url}/storage/v1/object/vigilance-captures/test_upload.json"
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "x-upsert": "true"
    }
    
    req = urllib.request.Request(url, data=test_data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            print("Upload Response:", res_body)
    except urllib.error.HTTPError as e:
        print("Upload Error:", e.code, e.reason)
        print("Response body:", e.read().decode('utf-8'))
        # Try PUT if POST failed
        print("Trying PUT...")
        req_put = urllib.request.Request(url, data=test_data, headers=headers, method="PUT")
        try:
            with urllib.request.urlopen(req_put) as response:
                print("PUT Upload Response:", response.read().decode('utf-8'))
        except urllib.error.HTTPError as e_put:
            print("PUT Upload Error:", e_put.code, e_put.reason)
            print("PUT Response body:", e_put.read().decode('utf-8'))
    except Exception as e:
        print("General Error:", e)
