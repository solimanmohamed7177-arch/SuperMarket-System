import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DB_SERVER   = os.getenv("DB_SERVER",   "localhost")
    DB_NAME     = os.getenv("DB_NAME",     "SuperMarketDB")
    DB_USER     = os.getenv("DB_USER",     "sa")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_DRIVER   = os.getenv("DB_DRIVER",   "ODBC Driver 17 for SQL Server")

    SECRET_KEY                  = os.getenv("SECRET_KEY",  "supersecretkey12345678901234567890")
    ALGORITHM                   = os.getenv("ALGORITHM",   "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

    APP_NAME    = os.getenv("APP_NAME",    "SuperMarket MS")
    APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
    DEBUG       = os.getenv("DEBUG",       "True").lower() == "true"

    ALLOWED_ORIGINS = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000"
    )

    @property
    def origins_list(self):
        return [x.strip() for x in self.ALLOWED_ORIGINS.split(",")]

    
    @property
    def DATABASE_URL(self):
        return (
            f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_SERVER}:{os.getenv('DB_PORT', '5432')}/{self.DB_NAME}"
        )



settings = Settings()