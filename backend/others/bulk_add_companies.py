import requests
import random
import time

API_URL = "http://127.0.0.1:5000/companies/add"   # Replace with your deployed API URL
JOBMELA_NAME = "Margadarsan"   # Replace with actual job mela name matching your JobMela ID

company_types = ['Hiring', 'Participation', 'Stalls', 'Others']

for i in range(1, 31):
    payload = {
        "jobMela": JOBMELA_NAME,
        "companyName": f"Company_{i}",
        "type": random.choice(company_types),
        "contactName": f"ContactPerson_{i}",
        "contactNumber": f"9876543{i:03}",
        "contactEmail": f"company{i}@example.com",
        "numParticipants": random.randint(1, 10),
        "participants": f"Participant_{i}"
    }

    response = requests.post(API_URL, json=payload)

    try:
        result = response.json()
    except Exception:
        result = response.text

    print(f"Company {i} → Status: {response.status_code} → Response: {result}")

    # Sleep to avoid hammering server (optional)
    time.sleep(0.2)
