import json
import aio_pika
from src.domain.entities import AIAnalysisResult
from src.domain.ports import AnalysisResultProducerPort

class RabbitMQProducerAdapter(AnalysisResultProducerPort):
    """
    Adapter to publish analysis results to RabbitMQ (towards MS-08).
    """
    def __init__(self, rabbitmq_url: str):
        self.rabbitmq_url = rabbitmq_url
        self.connection = None
        self.channel = None

    async def connect(self):
        self.connection = await aio_pika.connect_robust(self.rabbitmq_url)
        self.channel = await self.connection.channel()
        # Ensure queue/exchange exists (optional, depending on orchestration)
        # By convention in this project we will publish directly to a queue.
        # In this case we will publish to a queue named 'ai.analysis.results'
        self.queue = await self.channel.declare_queue("ai.analysis.results", durable=True)

    async def publish_result(self, result: AIAnalysisResult) -> None:
        if not self.channel:
            await self.connect()
            
        # Serialize with json and use ISO format for the date
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
