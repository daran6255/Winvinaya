import requests
import random
import time

# Base URLs
BASE_URL = "http://127.0.0.1:5000"
GET_COMPANIES_URL = f"{BASE_URL}/companies/get_all"
POST_JOB_URL = f"{BASE_URL}/jobs/add"

# Example pool of values
job_roles = ["Software Engineer", "Data Analyst", "QA Tester", "Project Manager", "Support Engineer"]
skills_pool = [
    "Python, SQL, Flask",
    "JavaScript, React, Node.js",
    "Java, Spring Boot",
    "C#, .NET, SQL Server",
    "HTML, CSS, Bootstrap"
]
experience_levels = ["Fresher", "0-1 years", "1-2 years", "2+ years"]
qualifications = ["B.Tech", "B.Sc", "B.Com", "M.Sc", "MBA"]
locations = ["Bangalore", "Chennai", "Hyderabad", "Pune", "Delhi"]

# Fetch all companies
resp = requests.get(GET_COMPANIES_URL)
companies_result = resp.json()

if companies_result["status"] != "success":
    print("Failed to fetch companies!")
    exit()

companies = companies_result["result"]

# Filter companies of type 'Hiring'
hiring_companies = [c for c in companies if c["type"] == "Hiring"]

if not hiring_companies:
    print("No hiring companies found.")
else:
    print(f"Found {len(hiring_companies)} hiring companies.")

job_counter = 0

# For each hiring company, create 3 jobs
for company in hiring_companies:
    company_name = company["companyName"]
    print(f"\nCreating jobs for company: {company_name}")
    for j in range(1, 4):
        payload = {
            "companyName": company_name,
            "jobRole": random.choice(job_roles),
            "skills": random.choice(skills_pool),
            "experienceLevel": random.choice(experience_levels),
            "educationQualification": random.choice(qualifications),
            "numOpenings": random.randint(1, 10),
            "location": random.choice(locations),
            "disabilityPreferred": random.choice(["Yes", "No"]),
            "approxSalary": float(random.randint(3, 12)),
            "rolesAndResponsibilities": f"Responsibilities for Job {j} at {company_name}",
            "description": f"This is job description {j} for {company_name}."
        }

        response = requests.post(POST_JOB_URL, json=payload)

        try:
            result = response.json()
        except Exception:
            result = response.text

        print(f"Job {j} for {company_name}: {response.status_code} → {result}")
        job_counter += 1

        time.sleep(0.2)  # optional, polite delay

print(f"\nFinished creating {job_counter} jobs.")
