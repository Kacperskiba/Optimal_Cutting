from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.schemas import OptimizeRequest, OptimizationResult
from app.services.optimizer import OptimizerService

app = FastAPI(title="Cutting Optimization API")

# Konfiguracja CORS (pozwala na komunikację z React/Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # W produkcji warto zmienić "*" na konkretny adres frontendu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/optimize", response_model=OptimizationResult)
async def optimize_endpoint(request: OptimizeRequest):
    """
    Endpoint przyjmuje listę formatek i konfigurację maszyny,
    a zwraca zoptymalizowany plan rozkroju.
    """
    return OptimizerService.calculate(request)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)