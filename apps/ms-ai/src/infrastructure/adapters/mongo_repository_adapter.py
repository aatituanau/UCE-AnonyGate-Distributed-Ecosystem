from motor.motor_asyncio import AsyncIOMotorClient
from src.domain.entities import AIAnalysisResult
from src.domain.ports import AIAnalysisRepositoryPort

class MongoAIAnalysisRepositoryAdapter(AIAnalysisRepositoryPort):
    """
    Adaptador de MongoDB para guardar los resultados del análisis.
    """
    def __init__(self, mongo_uri: str, db_name: str = "DB_AI_Summaries"):
        self.client = AsyncIOMotorClient(mongo_uri)
        self.db = self.client[db_name]
        self.collection = self.db["summaries"]

    async def save(self, result: AIAnalysisResult) -> None:
        # Convertimos la entidad de dominio a diccionario para guardarla en BD
        # model_dump() es el estándar en pydantic v2 (dict() en v1)
        doc = result.model_dump()
        
        # En MongoDB, solemos reemplazar 'id' por '_id', pero podemos guardar 'id' también.
        # Guardaremos '_id' para usarlo como primary key de Mongo
        if "id" in doc:
            doc["_id"] = doc.pop("id")
            
        await self.collection.insert_one(doc)

    def close(self):
        """Cierra la conexión a MongoDB."""
        self.client.close()
