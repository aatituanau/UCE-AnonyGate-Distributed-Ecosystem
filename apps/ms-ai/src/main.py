from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.infrastructure.config.settings import settings
from src.infrastructure.adapters.hf_inference_adapter import HuggingFaceInferenceAdapter
from src.infrastructure.adapters.mongo_repository_adapter import MongoAIAnalysisRepositoryAdapter
from src.infrastructure.adapters.rabbitmq_producer_adapter import RabbitMQProducerAdapter
from src.infrastructure.adapters.kafka_producer_adapter import KafkaProducerAdapter
from src.infrastructure.messaging.rabbitmq_consumer import RabbitMQConsumer
from src.application.use_cases import AnalyzeComplaintUseCase

# Global variables to handle connections in the lifespan
mongo_adapter = None
rabbitmq_producer = None
kafka_producer = None
rabbitmq_consumer = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global mongo_adapter, rabbitmq_producer, kafka_producer, rabbitmq_consumer
    
    print("[*] Iniciando MS-07 AI Insight Service...")
    
    # 1. Initialize adapters
    hf_adapter = HuggingFaceInferenceAdapter(api_token=settings.hf_api_token)
    mongo_adapter = MongoAIAnalysisRepositoryAdapter(mongo_uri=settings.mongo_uri)
    rabbitmq_producer = RabbitMQProducerAdapter(rabbitmq_url=settings.rabbitmq_url)
    kafka_producer = KafkaProducerAdapter(bootstrap_servers=settings.kafka_broker)
    
    # 2. Connect Producers
    await rabbitmq_producer.connect()
    await kafka_producer.connect()
    
    # 3. Initialize Use Case (Dependency Injection)
    use_case = AnalyzeComplaintUseCase(
        nlp_port=hf_adapter,
        repository_port=mongo_adapter,
        result_producer_port=rabbitmq_producer,
        audit_producer_port=kafka_producer
    )
    
    # 4. Initialize and start Consumer
    rabbitmq_consumer = RabbitMQConsumer(
        rabbitmq_url=settings.rabbitmq_url,
        use_case=use_case
    )
    await rabbitmq_consumer.start_consuming()
    
    yield # Here FastAPI is running and serving requests
    
    print("[*] Apagando MS-07 AI Insight Service...")
    # Cleanup resources
    if rabbitmq_consumer:
        await rabbitmq_consumer.stop()
    if rabbitmq_producer:
        await rabbitmq_producer.close()
    if kafka_producer:
        await kafka_producer.stop()
    if mongo_adapter:
        mongo_adapter.close()


# Initialize FastAPI app
app = FastAPI(
    title="MS-07 AI Insight Service",
    description="Natural Language Processing and Urgency Classification microservice.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In PROD this should be limited to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health endpoint for Load Balancer or Docker/K8s."""
    return {"status": "ok", "service": "ms-ai"}

@app.get("/api/insights/{complaint_id}")
async def get_insights(complaint_id: str):
    """Gets the AI analysis result by complaintId."""
    if not mongo_adapter:
        raise HTTPException(status_code=500, detail="Database connection not ready")
        
    result = await mongo_adapter.find_by_complaint_id(complaint_id)
    if not result:
        # Return 200 OK with null instead of 404 to prevent frontend console errors for pending complaints
        return None
        
    return result
