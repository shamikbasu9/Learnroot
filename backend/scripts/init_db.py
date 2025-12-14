#!/usr/bin/env python3

from config.database import test_connection, create_database

print("🔍 Testing database connection...")
test_connection()

print("🏗️  Initializing database tables...")
create_database()

print("✅ Database setup complete!")