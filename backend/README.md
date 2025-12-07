# WinVinaya Jobmela - Backend Service

## 📌 Overview

This is the backend service for the **WinVinaya Jobmela** web application, providing:

- Candidate registration
- File uploads (resume and disability certificate)
- Auto-filling city/state from pincode

## 🚀 Getting Started

## 🗂 Project Directory Structure

backend/
├── app/
│ ├── init.py # Flask app factory setup
│ ├── config.py # App configuration settings
│ ├── database.py # SQLAlchemy DB initialization
│ ├── api/ # API Blueprints
│ │ ├── signup.py # Candidate registration APIs
│ │ ├── login.py # (Optional) Admin login APIs
│ ├── models/
│ │ ├── admin_users.py # Admin user models
│ │ ├── candidates.py # Candidate data model
├── main.py # Entry point to run the Flask app
├── requirements.txt # Project dependencies

### Prerequisites

- Python 3.8+
- PostgreSQL (or your preferred database)
- Git

### 🛠 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd winvinaya-jobmela/backend

   ```

2. **Set up virtual environment**

   python -m venv venv

   #### Windows:

   venv\Scripts\activate

   #### Linux/macOS:

   source venv/bin/activate

3. **Install dependencies**

   pip install -r requirements.txt

4. **Configure environment variables**

   #### Create a .env file based on .env.example and update with your configuration:

   FLASK_APP=main.py
   FLASK_ENV=development

5. **Initialize the Migration folder**
   flask db init # Initialize migrations folder
   flask db migrate -m "Initial migration" # Generate migration script
   flask db upgrade # Apply migration to create tables

   flask seed-admin
   flask seed-dharanidaran-admin
   
   # Detect changes and generate migration script
   flask db migrate -m "Add created_by and updated_by to post_training_skill_analysis"
   flask db migrate -m "Add updated_by to candidate_registration"
   flask db migrate -m "Add created_by and updated_by to candidate_profile"
   flask db migrate -m "Add updated_by to company"
   flask db migrate -m "Add updated_by to jobs"
   flask db migrate -m "Add updated_by to candidate_job_mapping"
   flask db migrate -m "Add updated_by to interview"
   flask db migrate -m "Add updated_by to jobmela"
   flask db migrate -m "Add updated_by to jobrole added in the candidate evaluation"
   flask db migrate -m "Add candidate updates logs table"
   # Apply migration to the database
   flask db upgrade
   -----------------------------------------------------------------------------------------------
   # Step 1: Generate migration script

   flask db migrate -m "Add Job table"
   flask db migrate -m "Altered in Jobs table"

   # Step 2: Apply the migration to the database

   flask db upgrade

   flask db revision -m "Add job_mapped tables manually"
   flask db revision -m "Add job_mapped_candidates tables manually"

---

## Setup Instructions

### 1. ⚙️ Create and Activate Virtual Environment

```bash
### Create a virtual environment to isolate dependencies:
python -m venv venv

venv\Scripts\activate 		### (for windows) or
source venv/bin/activate	### (for ubuntu)

### Install Dependencies
pip install -r requirements.txt



### Start or run the Backend Server
python -m main

---

## How to Run Setup Scripts

### For Ubuntu / Linux / macOS (`start_app.sh`)

1. Open a terminal and navigate to the project directory where `start_app.sh` is located.

2. Make the script executable (only needed once):
   chmod +x start_app.sh

3. Run using this below
	./start_app.sh

### For Windows PowerShell (start_app.ps1)

1. Open PowerShell as Administrator (recommended).

2. Navigate to the project directory where start_app.ps1 is located.

3. (If not done before) allow script execution by running:
	Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

4. Run the script:
	.\start_app.ps1
```
