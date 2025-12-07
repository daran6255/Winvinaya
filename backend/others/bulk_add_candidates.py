import requests
import json
import random
import time

API_URL = "http://127.0.0.1:5000/candidates/add"   # or replace with your deployed API URL

# Path to the same PDF file to use for both uploads
PDF_PATH = r"C:\Users\daran\Downloads\7th Eng Science Part-1 2024-25-1-30.pdf"

# Replace with the actual name of the JobMela matching id 363287ae-6bed-49d7-9dc0-5d0a4b61b71f
JOBMELA_NAME = "Margadarsan"

# Some static lists for variety
degrees = ['BSc',                   
	'BA',                    
	'BE',                  	 
	'BTech',				
	'MSc',                   
	'MA',                    
	'MBA',                   
	'PhD',                   
	'Diploma in Eng',        
	'Diploma in Mgmt',       
	'ADT']
branches = ['Computer Science Engineering',
	'Electrical Engineering',
	'Mechanical Engineering',
	'Civil Engineering',
	'Electronics and Communication Engineering',
	'Chemical Engineering',
	'Aerospace Engineering',
	'Information Technology',
	'Biotechnology',
	'Environmental Engineering',
	'Structural Engineering',
	'Software Engineering',
	'Data Science & Engineering',
	'Embedded Systems',
	'Power Systems']
disability_types = ["Locomotor", "Vision", "Hearing"]
experience_types = ["Fresher", "Experienced"]
statuses = ["Employed", "Unemployed"]

for i in range(1, 201):

    candidate_name = f"Candidate_{i}"
    email = f"candidate{i}@example.com"
    phone = f"98765{str(10000 + i)}"
    guardian_name = f"Guardian_{i}"
    guardian_phone = f"98765{str(20000 + i)}"

    payload = {
        "name": candidate_name,
        "gender": random.choice(["Male", "Female", "Other"]),
        "email": email,
        "phone": phone,
        "guardian_name": guardian_name,
        "guardian_phone": guardian_phone,
        "pincode": "560001",
        "degree": random.choice(degrees),
        "branch": random.choice(branches),
        "disability_type": random.choice(disability_types),
        "disability_percentage": str(random.randint(40, 80)),
        "trained_by_winvinaya": random.choice(["Yes", "No"]),
        "skills": json.dumps(["Python", "SQL", "Excel"]),  # your API expects a JSON string
        "experience_type": random.choice(experience_types),
        "years_of_experience": str(random.randint(0, 5)),
        "current_status": random.choice(statuses),
        "previous_position": f"Position_{i}",
        "ready_to_relocate": random.choice(["Yes", "No"]),
        "jobmela_name": JOBMELA_NAME
    }

    files = {
        "resume": open(PDF_PATH, "rb"),
        "disability_certificate": open(PDF_PATH, "rb")
    }

    response = requests.post(API_URL, data=payload, files=files)

    print(f"Candidate {i}: {response.status_code} - {response.json()}")

    # Sleep to avoid hammering the server (optional)
    time.sleep(0.2)
