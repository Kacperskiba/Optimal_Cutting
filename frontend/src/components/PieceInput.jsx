import { Plus, Trash2, Layers, Upload, FileSpreadsheet } from 'lucide-react';
import { useRef } from 'react';

export function PieceInput({ pieces, onAdd, onUpdate, onRemove, onImport }) {
  const fileInputRef = useRef(null);

  // Funkcja obsługująca wgranie pliku
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseCSV(text);
    };
    reader.readAsText(file);

    // Reset inputu, żeby można było wgrać ten sam plik ponownie
    e.target.value = '';
  };

  // Parser CSV (obsługuje przecinek i średnik)
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/); // Podział na linie
    const newPieces = [];

    lines.forEach((line) => {
      if (!line.trim()) return; // Pomiń puste

      // Próba podziału średnikiem (Excel PL) lub przecinkiem (CSV standard)
      let parts = line.includes(';') ? line.split(';') : line.split(',');

      // Jeśli mamy nagłówek "Długość;Szerokość...", pomijamy go
      const firstVal = parseFloat(parts[0]);
      if (isNaN(firstVal)) return;

      if (parts.length >= 2) {
        newPieces.push({
          length: parseFloat(parts[0]) || 0,
          width: parseFloat(parts[1]) || 0,
          quantity: parseInt(parts[2]) || 1, // Domyślnie 1 sztuka
        });
      }
    });

    if (newPieces.length > 0) {
      onImport(newPieces);
    } else {
      alert("Nie znaleziono poprawnych danych w pliku CSV. Format: Długość;Szerokość;Ilość");
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4 text-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <h2 className="font-semibold text-sm uppercase tracking-wider">Formatki ({pieces.length})</h2>
        </div>

        <div className="flex gap-2">
            {/* Ukryty input pliku */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.txt"
                onChange={handleFileUpload}
            />

            {/* Przycisk Importu */}
            <button
            onClick={() => fileInputRef.current.click()}
            className="text-xs bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-2 py-1 rounded font-medium transition-colors flex items-center gap-1"
            title="Importuj CSV (Długość;Szerokość;Ilość)"
            >
            <FileSpreadsheet size={14} /> Import CSV
            </button>

            {/* Przycisk Dodaj Ręcznie */}
            <button
            onClick={onAdd}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium transition-colors flex items-center gap-1"
            >
            <Plus size={14} /> Dodaj
            </button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Nagłówek Tabeli */}
        {pieces.length > 0 && (
          <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 px-1">
            <div className="col-span-4">Długość</div>
            <div className="col-span-4">Szerokość</div>
            <div className="col-span-3">Ilość</div>
            <div className="col-span-1"></div>
          </div>
        )}

        {pieces.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm text-slate-500 mb-2">Brak elementów</p>
            <div className="flex justify-center gap-3">
                <button onClick={onAdd} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                   <Plus size={14}/> Dodaj ręcznie
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => fileInputRef.current.click()} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                   <Upload size={14}/> Wgraj plik
                </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Format pliku: Długość ; Szerokość ; Ilość</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pieces.map((piece, index) => (
              <div key={piece.id} className="grid grid-cols-12 gap-2 items-center group animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="col-span-4 relative">
                    <input
                      type="number"
                      placeholder="L"
                      value={piece.length}
                      onChange={(e) => onUpdate(piece.id, { length: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute right-2 top-1.5 text-xs text-slate-300 pointer-events-none">mm</span>
                </div>
                <div className="col-span-4 relative">
                    <input
                      type="number"
                      placeholder="W"
                      value={piece.width}
                      onChange={(e) => onUpdate(piece.id, { width: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="Qt"
                    value={piece.quantity}
                    onChange={(e) => onUpdate(piece.id, { quantity: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-sm text-center font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => onRemove(piece.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                    title="Usuń"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pieces.length > 0 && (
            <button
                onClick={onAdd}
                className="w-full py-2 border border-dashed border-slate-300 rounded text-slate-500 text-xs hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-1 mt-2"
            >
                <Plus size={14} /> Dodaj kolejny wiersz
            </button>
        )}
      </div>
    </section>
  );
}