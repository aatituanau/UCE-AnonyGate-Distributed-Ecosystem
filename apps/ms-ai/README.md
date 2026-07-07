# MS-AI (MS-07): AI Insight Service

This microservice is responsible for analyzing anonymous complaints using Natural Language Processing (NLP) models. It automatically determines the urgency level of a complaint and generates a concise summary to aid Compliance Officers.

## Architecture & Stack
- **Language**: Python 3.11
- **Framework**: FastAPI (for REST/Healthchecks)
- **Messaging**: RabbitMQ (Consumer for `complaint.nlp.requested`, Producer for `ai.analysis.results`), Kafka (Producer for `ai.analysis.completed` audit events)
- **Database**: MongoDB (`DB_AI_Summaries`)
- **AI Integration**: Hugging Face Inference API (`facebook/bart-base`) with a local fallback algorithm.

## Workflow
1. `ms-submission` publishes a message to RabbitMQ (`complaint.nlp.requested`) containing the complaint payload.
2. The Python worker (RabbitMQ Consumer) picks up the message.
3. The `AnalyzeComplaintUseCase` is triggered.
4. It calls the Hugging Face Inference API to generate a summary. If the API is unavailable, or a network block is detected, it seamlessly falls back to a deterministic local summarizer algorithm.
5. It calculates the urgency (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) based on predefined keywords in the payload.
6. The results are stored in MongoDB.
7. An RPC response (`ai.analysis.results`) is sent back to `ms-status` via RabbitMQ.
8. An audit event (`ai.analysis.completed`) is published to Kafka for the `ms-audit` service.

## Local Setup

### Requirements
- Python 3.11+
- `pip`

### Virtual Environment (Required for Turborepo)
To run this microservice seamlessly with the rest of the NestJS ecosystem via `npm run dev`, you **must** create and activate a Python virtual environment in your terminal before running the global Turborepo command.

```bash
cd apps/ms-ai
python -m venv venv

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running Locally
Once the virtual environment is activated, you can run the service directly or let Turborepo handle it:
```bash
uvicorn src.main:app --reload --port 3007 --host 127.0.0.1
```

## Environment Variables
Create a `.env` file based on `.env.example`:
```env
HUGGINGFACE_API_KEY=your_hf_token_here
RABBITMQ_URL=amqp://localhost:5672/
KAFKA_BROKER=localhost:9092
MONGO_URI=mongodb://localhost:27017
```

## Important Notes for QA/AWS
When deploying to AWS (e.g., using Docker Containers or EKS), ensure that the `HUGGINGFACE_API_KEY` is securely injected via AWS Secrets Manager or environment variables. The local fallback algorithm is strictly designed for local development resilience and will not be triggered in a healthy production network.
