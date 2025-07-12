$venv = "venv"

# Create virtual environment if not exists
if (-Not (Test-Path $venv)) {
    Write-Host "Creating virtual environment..."
    python -m venv $venv
} else {
    Write-Host "Virtual environment already exists."
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
& "$venv\Scripts\Activate.ps1"

Write-Host "Installing dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# Delete migrations folder if exists
if (Test-Path "migrations") {
    Write-Host "Removing existing migrations folder..."
    Remove-Item -Recurse -Force migrations
}

Write-Host "Running flask db commands..."
$env:FLASK_APP = "main.py"

flask db init
flask db migrate -m "Initial migration"
flask db upgrade

Write-Host "Setup complete. To run the app:"
Write-Host "  .\$venv\Scripts\Activate.ps1"
Write-Host "  flask run"
