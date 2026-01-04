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

class OptimizationResult(BaseModel):
    totalPlates: int
    efficiency: float
    totalCuts: int
    totalWaste: float
    plates: List[PlateResponse]