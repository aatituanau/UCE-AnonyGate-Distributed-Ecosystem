import json
import asyncio
from typing import Dict, Any
from aiokafka import AIOKafkaProducer
from src.domain.ports import AuditProducerPort

class KafkaProducerAdapter(AuditProducerPort):
    """
    Adapter to publish audit events to Kafka.
    Follows EDA rules for domain events.
    """
    def __init__(self, bootstrap_servers: str):
        self.bootstrap_servers = bootstrap_servers
        self.producer = None

    async def connect(self):
        # Es vital usar un loop existente
        loop = asyncio.get_event_loop()
        self.producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            loop=loop,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await self.producer.start()

    async def publish_audit_event(self, event_type: str, payload: Dict[str, Any]) -> None:
        if not self.producer:
            await self.connect()
            
        # To comply with 'domain.action' standard
        # The event_type comes as 'ai.analysis.completed'
        await self.producer.send_and_wait(event_type, payload)

    async def stop(self):
        if self.producer:
            await self.producer.stop()
