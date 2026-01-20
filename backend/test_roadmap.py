import requests
import json
import time

url = "http://localhost:8000/api/roadmap"
payload = [
    {
        "id": "1",
        "title": "Setup Auth",
        "description": "Implement authentication using JWT",
        "type": "feature",
        "status": "todo"
    },
    {
        "id": "2",
        "title": "User Profile",
        "description": "Create user profile page",
        "type": "feature",
        "status": "todo"
    },
     {
        "id": "3",
        "title": "Database Schema",
        "description": "Design initial DB schema",
        "type": "chore",
        "status": "todo"
    }
]

print(f"Sending request to {url}...")
start = time.time()
try:
    response = requests.post(url, json=payload)
    duration = time.time() - start
    print(f"Request took {duration:.2f} seconds")
    
    if response.status_code == 200:
        print("Success!")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Failed with status {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
