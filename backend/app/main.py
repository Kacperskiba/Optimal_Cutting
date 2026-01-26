from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.schemas import OptimizeRequest, OptimizationResult
from app.services.optimizer import OptimizerService

app = FastAPI(title="Cutting Optimization API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/optimize", response_model=OptimizationResult)
async def optimize_endpoint(request: OptimizeRequest):

    return OptimizerService.calculate(request)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)