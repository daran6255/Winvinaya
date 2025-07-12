#!/bin/bash

# Detect OS
OS="$(uname)"
VENV_DIR="venv"

echo "Detected OS: $OS"

# Create virtual environment if not exists
if [ ! -d "$VENV_DIR" ]; then
  echo "Creating virtual environment..."
  python3 -m venv $VENV_DIR
else
  echo "Virtual environment already exists."
fi

# Activate virtual environment
if [[ "$OS" == "Linux" || "$OS" == "Darwin" ]]; then
  source $VENV_DIR/bin/activate
elif [[ "$OS" == *"MINGW"* || "$OS" == *"CYGWIN"* ]]; then
  # For Git Bash on Windows
  source $VENV_DIR/Scripts/activate
else
  echo "Unknown OS, please activate the virtual environment manually."
  exit 1
fi

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Delete migrations folder if exists
if [ -d "migrations" ]; then
  echo "Removing existing migrations folder..."
  rm -rf migrations
fi

echo "Running flask db commands..."
export FLASK_APP=main.py

flask db init
flask db migrate -m "Initial migration"
flask db upgrade

echo "Setup complete. To run the app:"
echo "  source $VENV_DIR/bin/activate"
echo "  flask run"
