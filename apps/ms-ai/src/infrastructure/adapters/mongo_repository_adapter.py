from motor.motor_asyncio import AsyncIOMotorClient
from src.domain.entities import AIAnalysisResult
from src.domain.ports import AIAnalysisRepositoryPort

class MongoAIAnalysisRepositoryAdapter(AIAnalysisRepositoryPort):
    """
    MongoDB Adapter to save the analysis results.
    """
    def __init__(self, mongo_uri: str, db_name: str = "DB_AI_Summaries"):
        self.client = AsyncIOMotorClient(mongo_uri)
        self.db = self.client[db_name]
        self.collection = self.db["summaries"]

    async def save(self, result: AIAnalysisResult) -> None:
        # Convert the domain entity to dictionary to save it in DB
        # model_dump() is standard in pydantic v2 (dict() in v1)
        doc = result.model_dump()
        
        # In MongoDB, we usually replace 'id' with '_id'
        # We will save '_id' to use it as Mongo's primary key
        if "id" in doc:
            doc["_id"] = doc.pop("id")
            
        await self.collection.insert_one(doc)

    async def find_by_complaint_id(self, complaint_id: str) -> AIAnalysisResult | None:
        doc = await self.collection.find_one({"complaintId": complaint_id})
        if not doc:
            return None
            
        # Revert _id to id to instantiate the entity
        doc["id"] = doc.pop("_id")
        return AIAnalysisResult(**doc)

    def close(self):
        """Closes the MongoDB connection."""
        self.client.close()
