from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Carga y valida las variables de entorno para la infraestructura.
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

# Instancia global de settings
settings = Settings()
