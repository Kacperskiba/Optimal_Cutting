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

        raw_plates = []  # Tymczasowa lista na wszystkie wygenerowane układy

        # 1. Wyciągamy dane z rectpack (tak jak wcześniej)
        for bin_idx, abin in enumerate(packer):
            cuts_on_plate = []
            used_area_on_plate = 0

            # Obliczamy długość cięcia dla tej konkretnej płyty (do czasu)
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

                    # Do estymacji czasu: dodajemy obwód/krawędzie cięcia
                    # Uproszczenie: każde cięcie to długość + szerokość elementu
                    cuts_length_mm += (actual_w + actual_l)

            if cuts_on_plate:
                # Sortujemy cięcia, żeby móc porównać układy (ważne dla pakietowania!)
                cuts_on_plate.sort(key=lambda c: (c.x, c.y, c.length))

                raw_plates.append({
                    "cuts": cuts_on_plate,
                    "usedArea": used_area_on_plate,
                    "cutsLength": cuts_length_mm
                })

        # 2. PAKIETOWANIE (Grupowanie identycznych płyt)
        grouped_plates = []

        # Prosta logika: tworzymy "podpis" (string) dla każdej płyty i grupujemy
        # Podpis to np: "x10-y20-L500-W300|x50-y20..."
        seen_layouts = {}  # Klucz: podpis, Wartość: index w grouped_plates

        for p in raw_plates:
            # Tworzymy unikalny klucz układu
            layout_signature = "|".join([f"{c.x:.1f}-{c.y:.1f}-{c.length:.1f}-{c.width:.1f}" for c in p['cuts']])

            if layout_signature in seen_layouts:
                # Jeśli już widzieliśmy ten układ, zwiększamy licznik
                idx = seen_layouts[layout_signature]
                grouped_plates[idx].quantity += 1
            else:
                # Nowy układ
                new_plate = PlateResponse(
                    plateNumber=len(grouped_plates) + 1,
                    totalArea=plate_len * plate_wid,
                    usedArea=p['usedArea'],
                    cuts=p['cuts'],
                    quantity=1  # Startujemy od 1
                )
                grouped_plates.append(new_plate)
                seen_layouts[layout_signature] = len(grouped_plates) - 1

        # 3. OBLICZANIE CZASU
        # Dane z configu
        speed_m_min = request.config.cuttingSpeed
        handling_sec = request.config.handlingTime
        loading_sec = request.config.loadingTime

        total_cuts_count = 0
        total_used_area = 0
        total_time_seconds = 0

        for plate in grouped_plates:
            # Statystyki ogólne
            count = plate.quantity
            cuts_count = len(plate.cuts)

            total_cuts_count += (cuts_count * count)
            total_used_area += (plate.usedArea * count)

            # --- ESTYMACJA CZASU DLA TEJ GRUPY PŁYT ---

            # A. Czas załadunku (raz na pakiet lub raz na płytę - załóżmy, że raz na płytę)
            time_load = count * loading_sec

            # B. Czas cięcia (długość drogi piły)
            # Przybliżenie: suma obwodów elementów / prędkość
            # (W realnej pile dochodzą powroty, więc mnożymy x1.2 dla bezpieczeństwa)
            cuts_len_meters = sum([(c.length + c.width) / 1000 for c in plate.cuts])
            time_cut_min = (cuts_len_meters / speed_m_min) * count * 1.2
            time_cut_sec = time_cut_min * 60

            # C. Czas manipulacji (ilość elementów * czas na element)
            time_handle = (cuts_count * handling_sec) * count

            total_time_seconds += (time_load + time_cut_sec + time_handle)

        # Formatowanie czasu (np. 1h 25m)
        hours = int(total_time_seconds // 3600)
        minutes = int((total_time_seconds % 3600) // 60)
        time_str = f"{minutes}m"
        if hours > 0:
            time_str = f"{hours}h {minutes}m"

        # Wydajność
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