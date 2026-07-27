import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "Skylark Founder Executive Intelligence Agent"
    VERSION: str = "1.0.0"
    MONDAY_API_KEY: str = os.getenv("MONDAY_API_KEY", "")
    MONDAY_API_URL: str = "https://api.monday.com/v2"
    DEFAULT_TIMEOUT: int = 10

settings = Settings()
