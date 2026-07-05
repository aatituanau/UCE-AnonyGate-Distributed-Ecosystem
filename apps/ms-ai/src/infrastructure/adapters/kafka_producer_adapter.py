import json
import asyncio
from typing import Dict, Any
from aiokafka import AIOKafkaProducer
from src.domain.ports import AuditProducerPort

class KafkaProducerAdapter(AuditProducerPort):
    """
    Adaptador para publicar eventos de auditoría en Kafka (hacia MS-10).
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
            
        # Para cumplir el standard de 'dominio.accion'
        # El event_type viene como 'ai.analysis.completed'
        await self.producer.send_and_wait(event_type, payload)

    async def stop(self):
        if self.producer:
            await self.producer.stop()
