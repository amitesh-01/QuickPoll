#!/usr/bin/env bash
# Exit on error
set -o errexit

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Run database migrations (create tables)
python -c "
from core.database import engine
from models.models import Base
print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('Database tables created successfully!')
"