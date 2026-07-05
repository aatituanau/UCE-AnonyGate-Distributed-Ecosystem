from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.infrastructure.config.settings import settings
from src.infrastructure.adapters.hf_inference_adapter import HuggingFaceInferenceAdapter
from src.infrastructure.adapters.mongo_repository_adapter import MongoAIAnalysisRepositoryAdapter
from src.infrastructure.adapters.rabbitmq_producer_adapter import RabbitMQProducerAdapter
from src.infrastructure.adapters.kafka_producer_adapter import KafkaProducerAdapter
from src.infrastructure.messaging.rabbitmq_consumer import RabbitMQConsumer
from src.application.use_cases import AnalyzeComplaintUseCase

# Variables globales para manejar las conexiones en el lifespan
mongo_adapter = None
rabbitmq_producer = None
kafka_producer = None
rabbitmq_consumer = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global mongo_adapter, rabbitmq_producer, kafka_producer, rabbitmq_consumer
    
    print("[*] Iniciando MS-07 AI Insight Service...")
    
    # 1. Inicializar adaptadores
    hf_adapter = HuggingFaceInferenceAdapter(api_token=settings.hf_api_token)
    mongo_adapter = MongoAIAnalysisRepositoryAdapter(mongo_uri=settings.mongo_uri)
    rabbitmq_producer = RabbitMQProducerAdapter(rabbitmq_url=settings.rabbitmq_url)
    kafka_producer = KafkaProducerAdapter(bootstrap_servers=settings.kafka_broker)
    
    # 2. Conectar Producers
    await rabbitmq_producer.connect()
    await kafka_producer.connect()
    
    # 3. Inicializar Caso de Uso (Inyección de Dependencias)
    use_case = AnalyzeComplaintUseCase(
        nlp_port=hf_adapter,
        repository_port=mongo_adapter,
        result_producer_port=rabbitmq_producer,
        audit_producer_port=kafka_producer
    )
    
    # 4. Inicializar y arrancar el Consumer
    rabbitmq_consumer = RabbitMQConsumer(
        rabbitmq_url=settings.rabbitmq_url,
        use_case=use_case
    )
    await rabbitmq_consumer.start_consuming()
    
    yield # Aquí FastAPI está corriendo y atendiendo peticiones
    
    print("[*] Apagando MS-07 AI Insight Service...")
    # Limpiar recursos
    if rabbitmq_consumer:
        await rabbitmq_consumer.stop()
    if rabbitmq_producer:
        await rabbitmq_producer.close()
    if kafka_producer:
        await kafka_producer.stop()
    if mongo_adapter:
        mongo_adapter.close()


# Inicializamos la app de FastAPI
app = FastAPI(
    title="MS-07 AI Insight Service",
    description="Microservicio de procesamiento de lenguaje natural y clasificación de urgencia.",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
async def health_check():
    """Endpoint de salud para el Load Balancer o Docker/K8s."""
    return {"status": "ok", "service": "ms-ai"}
