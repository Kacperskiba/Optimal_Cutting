from pydantic import BaseModel
from typing import List, Optional

class PieceRequest(BaseModel):
    id: str
    length: float
    width: float
    quantity: int

class ConfigRequest(BaseModel):
    sawWidth: float
    plateLength: float
    plateWidth: float
    algorithm: str = "guillotine"
    allowRotation: bool = True
    cuttingSpeed: int = 20
    handlingTime: int = 5
    loadingTime: int = 60

class OptimizeRequest(BaseModel):
    pieces: List[PieceRequest]
    config: ConfigRequest

# --- Modele Wyjściowe (Response) ---

class CutResponse(BaseModel):
    id: str
    x: float
    y: float
    length: float
    width: float
    pieceId: str
    rotated: bool

class PlateResponse(BaseModel):
    plateNumber: int
    totalArea: float
    usedArea: float
    cuts: List[CutResponse]
    quantity: int = 1

class OptimizationResult(BaseModel):
    totalPlates: int
    efficiency: float
    totalCuts: int
    totalWaste: float
    estimatedTime: str = "0m"
    plates: List[PlateResponse]