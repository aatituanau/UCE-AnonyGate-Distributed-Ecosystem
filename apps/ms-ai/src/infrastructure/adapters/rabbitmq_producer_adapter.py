import json
import aio_pika
from src.domain.entities import AIAnalysisResult
from src.domain.ports import AnalysisResultProducerPort

class RabbitMQProducerAdapter(AnalysisResultProducerPort):
    """
    Adaptador para publicar resultados del análisis en RabbitMQ (hacia MS-08).
    """
    def __init__(self, rabbitmq_url: str):
        self.rabbitmq_url = rabbitmq_url
        self.connection = None
        self.channel = None

    async def connect(self):
        self.connection = await aio_pika.connect_robust(self.rabbitmq_url)
        self.channel = await self.connection.channel()
        # Aseguramos que la cola/exchange existe (opcional, dependiendo de cómo orquesten)
        # Por convención en este proyecto usaremos un exchange tipo 'topic' o directo a cola.
        # En este caso publicaremos a una cola llamada 'ai.analysis.results'
        self.queue = await self.channel.declare_queue("ai.analysis.results", durable=True)

    async def publish_result(self, result: AIAnalysisResult) -> None:
        if not self.channel:
            await self.connect()
            
        # serializamos con json y le damos formato ISO a la fecha
        payload = result.model_dump()
        payload['createdAt'] = payload['createdAt'].isoformat()
        
        message = aio_pika.Message(
            body=json.dumps(payload).encode(),
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT
        )
        
        await self.channel.default_exchange.publish(
            message,
            routing_key="ai.analysis.results"
        )

    async def close(self):
        if self.connection:
            await self.connection.close()
