import json
import asyncio
import aio_pika
from src.application.use_cases import AnalyzeComplaintUseCase

class RabbitMQConsumer:
    """
    Consumidor de RabbitMQ que escucha peticiones de análisis NLP.
    """
    def __init__(self, rabbitmq_url: str, use_case: AnalyzeComplaintUseCase):
        self.rabbitmq_url = rabbitmq_url
        self.use_case = use_case
        self.connection = None
        self.channel = None

    async def start_consuming(self):
        self.connection = await aio_pika.connect_robust(self.rabbitmq_url)
        self.channel = await self.connection.channel()
        
        # Declaramos la cola desde la que leemos
        queue = await self.channel.declare_queue("complaint.nlp.requested", durable=True)
        
        # Empezamos a consumir mensajes
        await queue.consume(self._on_message)
        print("[*] Waiting for messages in complaint.nlp.requested")

    async def _on_message(self, message: aio_pika.IncomingMessage):
        async with message.process():
            # El context manager `process` de aio_pika hace el ack/nack automáticamente
            try:
                body = message.body.decode()
                payload = json.loads(body)
                
                complaint_id = payload.get("complaintId")
                alias_token = payload.get("aliasToken")
                text = payload.get("text", "")
                
                if complaint_id and text:
                    print(f"[*] Processing complaint {complaint_id}")
                    # Ejecutamos el caso de uso
                    await self.use_case.execute(complaint_id, alias_token, text)
                    print(f"[*] Finished processing complaint {complaint_id}")
                else:
                    print("[!] Invalid payload: missing complaintId or text")
            except Exception as e:
                print(f"[!] Error processing message: {str(e)}")

    async def stop(self):
        if self.connection:
            await self.connection.close()
