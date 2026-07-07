import pika
import json
import uuid

# Connection to RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Declare queue
channel.queue_declare(queue='complaint.nlp.requested', durable=True)

# Message payload
payload = {
    "complaintId": "bec3aef3-6c8c-4058-8adf-35441975ffd2",
    "text": "Acoso me mira en clases y me siento muy insegura. Es un acto de corrupcion e irregularidad."
}

# Publish message
channel.basic_publish(
    exchange='',
    routing_key='complaint.nlp.requested',
    body=json.dumps(payload),
    properties=pika.BasicProperties(
        delivery_mode=2,  # make message persistent
    )
)
print(" [x] Sent complaint.nlp.requested for bec3aef3-6c8c-4058-8adf-35441975ffd2")
connection.close()
