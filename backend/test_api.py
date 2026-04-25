import requests

BASE_URL = "http://127.0.0.1:8000"

print("1. Registering user...")
res = requests.post(f"{BASE_URL}/register", json={"username": "testuser_new_4", "password": "password123"})
print("Status:", res.status_code)
print("Response:", res.json())

print("\n2. Logging in...")
res = requests.post(f"{BASE_URL}/token", data={"username": "testuser_new_4", "password": "password123"})
print("Status:", res.status_code)
print("Response:", res.json())

token = res.json().get("access_token")
if token:
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n3. Predicting text...")
    res = requests.post(f"{BASE_URL}/predict/text", json={"text": "BREAKING: Scientists have discovered a new planet made entirely of diamond just outside our solar system, according to a recent NASA press release."}, headers=headers)
    print("Status:", res.status_code)
    print("Response:", res.json())
else:
    print("\nSkipping prediction because login failed.")
