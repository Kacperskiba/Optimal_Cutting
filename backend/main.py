from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

import rectpack.skyline as skyline
import rectpack.maxrects as maxrects
from rectpack import newPacker, PackingMode
import rectpack.guillotine as guillotine
import rectpack.packer as packer_module  # Tu są algorytmy MaxRects i Skyline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PieceRequest(BaseModel):
    id: str
    length: float
    width: float
    quantity: int


class ConfigRequest(BaseModel):
    sawWidth: float
    plateLength: float
    plateWidth: float
    algorithm: str = "guillotine"  # Nowe pole: domyślnie gilotyna


class OptimizeRequest(BaseModel):
    pieces: List[PieceRequest]
    config: ConfigRequest


# ... (Modele CutResponse, PlateResponse, OptimizationResult bez zmian) ...
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


@app.post("/optimize", response_model=OptimizationResult)
async def optimize_cuts(request: OptimizeRequest):
    saw_kerf = request.config.sawWidth
    plate_len = request.config.plateLength
    plate_wid = request.config.plateWidth

    # Wybór algorytmu na podstawie żądania
    algo_choice = request.config.algorithm
    selected_algo = None

    if algo_choice == "nesting":
        # MaxRectsBl (Bottom Left) - "Tetris", bardzo ciasne upakowanie (CNC/Laser)
        selected_algo = maxrects.MaxRectsBl
    elif algo_choice == "simple":
        # SkylineBl (Bottom Left) - Układanie "półkowe" (warstwami), proste i czytelne
        selected_algo = skyline.SkylineBl
    else:
        # Domyślnie: Gilotyna (GuillotineBSSFSas) - Najlepsza na piłę formatową
        selected_algo = guillotine.GuillotineBssfSas

    packer = newPacker(
        mode=PackingMode.Offline,
        rotation=True,
        pack_algo=selected_algo
    )

    # 1. Dodawanie elementów
    original_pieces = {}

    for p in request.pieces:
        # Walidacja
        max_dim = max(p.length, p.width)
        min_dim = min(p.length, p.width)
        plate_max = max(plate_len, plate_wid)
        plate_min = min(plate_len, plate_wid)

        if max_dim > plate_max or min_dim > plate_min:
            raise HTTPException(status_code=400, detail=f"Element {p.length}x{p.width} jest za duży na płytę.")

        for i in range(p.quantity):
            piece_uid = f"{p.id}-{i}"
            original_pieces[piece_uid] = {
                "base_id": p.id,
                "length": p.length,
                "width": p.width
            }
            packer.add_rect(p.width + saw_kerf, p.length + saw_kerf, piece_uid)

    # 2. Dodawanie płyt
    for _ in range(100):
        # Kolejność wymiarów (Długość, Szerokość)
        packer.add_bin(plate_len + saw_kerf, plate_wid + saw_kerf)

    # 3. Pakowanie
    packer.pack()

    # 4. Wyniki (ta sama logika co wcześniej)
    output_plates = []
    total_cuts_count = 0

    for bin_idx, abin in enumerate(packer):
        cuts_on_plate = []
        used_area_on_plate = 0

        for rect in abin:
            x, y, w, h, rid = rect.x, rect.y, rect.width, rect.height, rect.rid

            if rid in original_pieces:
                orig = original_pieces[rid]
                actual_w = w - saw_kerf
                actual_l = h - saw_kerf

                is_rotated = False
                if abs(actual_w - orig["length"]) < 0.1:
                    is_rotated = True

                cuts_on_plate.append(CutResponse(
                    id=str(rid),
                    pieceId=orig["base_id"],
                    length=actual_w,
                    width=actual_l,
                    x=x,
                    y=y,
                    rotated=is_rotated
                ))
                used_area_on_plate += (actual_w * actual_l)
                total_cuts_count += 1

        if len(cuts_on_plate) > 0:
            output_plates.append(PlateResponse(
                plateNumber=bin_idx + 1,
                totalArea=plate_len * plate_wid,
                usedArea=used_area_on_plate,
                cuts=cuts_on_plate
            ))

    total_area_all = sum(p.totalArea for p in output_plates)
    total_used_all = sum(p.usedArea for p in output_plates)
    efficiency = 0
    if total_area_all > 0:
        efficiency = (total_used_all / total_area_all) * 100

    return OptimizationResult(
        totalPlates=len(output_plates),
        efficiency=round(efficiency, 2),
        totalCuts=total_cuts_count,
        totalWaste=total_area_all - total_used_all,
        plates=output_plates
    )