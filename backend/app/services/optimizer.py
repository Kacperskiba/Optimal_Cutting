from fastapi import HTTPException
from rectpack import newPacker, PackingMode
import rectpack.guillotine as guillotine
import rectpack.skyline as skyline
from rectpack.maxrects import MaxRectsBl

from app.schemas import OptimizeRequest, OptimizationResult, PlateResponse, CutResponse


class OptimizerService:
    @staticmethod
    def calculate(request: OptimizeRequest) -> OptimizationResult:
        saw_kerf = request.config.sawWidth
        plate_len = request.config.plateLength
        plate_wid = request.config.plateWidth

        algo_choice = request.config.algorithm
        selected_algo = guillotine.GuillotineBssfSas

        if algo_choice == "nesting":
            selected_algo = MaxRectsBl
        elif algo_choice == "simple":
            selected_algo = skyline.SkylineBl
        elif algo_choice == "strips":
            selected_algo = guillotine.GuillotineBlsfLas

        packer = newPacker(
            mode=PackingMode.Offline,
            rotation=request.config.allowRotation,
            pack_algo=selected_algo
        )

        original_pieces = {}

        plate_max = max(plate_len, plate_wid)
        plate_min = min(plate_len, plate_wid)

        for p in request.pieces:
            if request.config.allowRotation:
                piece_fits = max(p.length, p.width) <= plate_max and min(p.length, p.width) <= plate_min
            else:
                piece_fits = p.length <= plate_len and p.width <= plate_wid

            if not piece_fits:
                raise HTTPException(
                    status_code=400,
                    detail=f"Element ID {p.id} ({p.length}x{p.width}) jest za duży na płytę ({plate_len}x{plate_wid})."
                )

            for i in range(p.quantity):
                piece_uid = f"{p.id}-{i}"
                original_pieces[piece_uid] = {
                    "base_id": p.id,
                    "length": p.length,
                    "width": p.width
                }
                packer.add_rect(p.width + saw_kerf, p.length + saw_kerf, piece_uid)
        for _ in range(100):
            packer.add_bin(plate_len + saw_kerf, plate_wid + saw_kerf)

        packer.pack()

        raw_plates = []

        for bin_idx, abin in enumerate(packer):
            cuts_on_plate = []
            used_area_on_plate = 0

            cuts_length_mm = 0

            for rect in abin:
                if rect.rid in original_pieces:
                    orig = original_pieces[rect.rid]
                    actual_w = rect.width - saw_kerf
                    actual_l = rect.height - saw_kerf

                    is_rotated = abs(actual_w - orig["length"]) < 0.1

                    cuts_on_plate.append(CutResponse(
                        id=str(rect.rid),
                        pieceId=orig["base_id"],
                        length=actual_w,
                        width=actual_l,
                        x=rect.x,
                        y=rect.y,
                        rotated=is_rotated
                    ))
                    used_area_on_plate += (actual_w * actual_l)
                    cuts_length_mm += (actual_w + actual_l)

            if cuts_on_plate:
                cuts_on_plate.sort(key=lambda c: (c.x, c.y, c.length))

                raw_plates.append({
                    "cuts": cuts_on_plate,
                    "usedArea": used_area_on_plate,
                    "cutsLength": cuts_length_mm
                })

        grouped_plates = []

        seen_layouts = {}

        for p in raw_plates:
            layout_signature = "|".join([f"{c.x:.1f}-{c.y:.1f}-{c.length:.1f}-{c.width:.1f}" for c in p['cuts']])

            if layout_signature in seen_layouts:
                idx = seen_layouts[layout_signature]
                grouped_plates[idx].quantity += 1
            else:
                new_plate = PlateResponse(
                    plateNumber=len(grouped_plates) + 1,
                    totalArea=plate_len * plate_wid,
                    usedArea=p['usedArea'],
                    cuts=p['cuts'],
                    quantity=1
                )
                grouped_plates.append(new_plate)
                seen_layouts[layout_signature] = len(grouped_plates) - 1
        speed_m_min = request.config.cuttingSpeed
        handling_sec = request.config.handlingTime
        loading_sec = request.config.loadingTime

        total_cuts_count = 0
        total_used_area = 0
        total_time_seconds = 0

        for plate in grouped_plates:
            count = plate.quantity
            cuts_count = len(plate.cuts)
            total_cuts_count += (cuts_count * count)
            total_used_area += (plate.usedArea * count)

            time_load = count * loading_sec

            cuts_len_meters = sum([(c.length + c.width) / 1000 for c in plate.cuts])
            time_cut_min = (cuts_len_meters / speed_m_min) * count * 1.2
            time_cut_sec = time_cut_min * 60

            time_handle = (cuts_count * handling_sec) * count

            total_time_seconds += (time_load + time_cut_sec + time_handle)
        hours = int(total_time_seconds // 3600)
        minutes = int((total_time_seconds % 3600) // 60)
        time_str = f"{minutes}m"
        if hours > 0:
            time_str = f"{hours}h {minutes}m"

        total_plates_count = sum(p.quantity for p in grouped_plates)
        total_area_all = total_plates_count * (plate_len * plate_wid)
        efficiency = 0
        if total_area_all > 0:
            efficiency = (total_used_area / total_area_all) * 100

        return OptimizationResult(
            totalPlates=total_plates_count,
            efficiency=round(efficiency, 2),
            totalCuts=total_cuts_count,
            totalWaste=total_area_all - total_used_area,
            estimatedTime=time_str,
            plates=grouped_plates
        )