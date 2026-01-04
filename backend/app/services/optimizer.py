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

        # 1. Wybór algorytmu
        algo_choice = request.config.algorithm
        selected_algo = guillotine.GuillotineBssfSas  # Domyślny

        if algo_choice == "nesting":
            selected_algo = MaxRectsBl
        elif algo_choice == "simple":
            selected_algo = skyline.SkylineBl
        elif algo_choice == "strips":
            selected_algo = guillotine.GuillotineBlsfLas

        # 2. Inicjalizacja Packera
        packer = newPacker(
            mode=PackingMode.Offline,
            rotation=request.config.allowRotation,
            pack_algo=selected_algo
        )

        # 3. Dodawanie elementów (Formatki)
        original_pieces = {}

        # Walidacja wymiarów płyty
        plate_max = max(plate_len, plate_wid)
        plate_min = min(plate_len, plate_wid)

        for p in request.pieces:
            # Szybka walidacja, czy element w ogóle się zmieści
            if request.config.allowRotation:
                piece_fits = max(p.length, p.width) <= plate_max and min(p.length, p.width) <= plate_min
            else:
                # Jeśli brak rotacji, wymiary muszą pasować dokładnie (z uwzględnieniem, który to długość/szerokość)
                # Tutaj upraszczamy: sprawdzamy czy element nie przekracza płyty w żadną stronę
                piece_fits = p.length <= plate_len and p.width <= plate_wid

            if not piece_fits:
                raise HTTPException(
                    status_code=400,
                    detail=f"Element ID {p.id} ({p.length}x{p.width}) jest za duży na płytę ({plate_len}x{plate_wid})."
                )

            for i in range(p.quantity):
                # Unikalne ID dla każdego fizycznego kawałka
                piece_uid = f"{p.id}-{i}"
                original_pieces[piece_uid] = {
                    "base_id": p.id,
                    "length": p.length,
                    "width": p.width
                }
                # Rectpack oczekuje wymiarów powiększonych o rzaz (poza ostatnim cięciem, ale upraszczamy)
                packer.add_rect(p.width + saw_kerf, p.length + saw_kerf, piece_uid)

        # 4. Dodawanie Płyt (Binów)
        # Dodajemy zapas płyt (np. 100), żeby algorytm miał z czego brać
        for _ in range(100):
            packer.add_bin(plate_len + saw_kerf, plate_wid + saw_kerf)

        # 5. Uruchomienie obliczeń
        packer.pack()

        # 6. Przetwarzanie wyników
        output_plates = []
        total_cuts_count = 0

        for bin_idx, abin in enumerate(packer):
            cuts_on_plate = []
            used_area_on_plate = 0

            for rect in abin:
                # rid to nasze piece_uid
                if rect.rid in original_pieces:
                    orig = original_pieces[rect.rid]

                    # Odejmujemy rzaz, żeby wrócić do wymiaru netto
                    actual_w = rect.width - saw_kerf
                    actual_l = rect.height - saw_kerf

                    # Wykrywanie obrotu
                    # Sprawdzamy czy szerokość po cięciu pasuje do oryginalnej długości
                    is_rotated = False
                    if abs(actual_w - orig["length"]) < 0.1:
                        is_rotated = True

                    # UWAGA: Rectpack zwraca x,y od dołu-lewej.
                    # Frontend rysuje od góry-lewej (canvas).
                    # Zwykle nie trzeba tego zmieniać, jeśli wizualizacja to obsługuje,
                    # ale warto pamiętać. Tutaj zwracamy surowe dane.

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
                    total_cuts_count += 1

            # Jeśli na płycie coś jest, dodajemy ją do wyniku
            if cuts_on_plate:
                output_plates.append(PlateResponse(
                    plateNumber=bin_idx + 1,
                    totalArea=plate_len * plate_wid,
                    usedArea=used_area_on_plate,
                    cuts=cuts_on_plate
                ))

        # Statystyki końcowe
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