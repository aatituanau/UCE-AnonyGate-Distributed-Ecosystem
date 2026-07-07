from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    """
    Loads and validates environment variables for infrastructure.
    """
    # FastAPI
    port: int = 3007
    
    # Message Brokers
    rabbitmq_url: str
    kafka_broker: str
    
    # Database
    mongo_uri: str
    
    # HuggingFace
    hf_api_token: Optional[str] = Field(default="", alias="HUGGINGFACE_API_KEY")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Global settings instance
settings = Settings()
