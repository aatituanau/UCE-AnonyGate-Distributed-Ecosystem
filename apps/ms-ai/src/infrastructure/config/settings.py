from pydantic_settings import BaseSettings

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
    hf_api_token: str
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Global settings instance
settings = Settings()
