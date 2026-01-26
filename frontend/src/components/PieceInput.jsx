import { Plus, Trash2, Layers, Upload, FileSpreadsheet, Eraser } from 'lucide-react';
import { useRef } from 'react';

export function PieceInput({ pieces, onAdd, onUpdate, onRemove, onImport, onClear }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      parseCSV(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/);
    const newPieces = [];

    const firstLine = lines[0] || "";
    const delimiter = firstLine.includes(';') ? ';' : ',';


    let isProductionFormat = false;
    if (firstLine.includes('Indeks') || firstLine.includes('Nazwa') || firstLine.includes('Długość')) {
        isProductionFormat = true;
    }

    lines.forEach((line, index) => {
      if (!line.trim()) return;

      if (isProductionFormat && index === 0) return;

      const parts = line.split(delimiter);

      if (isProductionFormat) {

          if (parts.length >= 5) {
              const len = parseFloat(parts[3]?.replace(',', '.'));
              const wid = parseFloat(parts[4]?.replace(',', '.'));
              const qty = parseInt(parts[6]);
              let name = parts[1]?.trim();
              if (!name) name = parts[0]?.trim();

              if (!isNaN(len) && !isNaN(wid) && !isNaN(qty)) {
                  newPieces.push({
                      // np. "BOK_GARDEROBY (1)"
                      id: `${name} (${index})`,
                      length: len,
                      width: wid,
                      quantity: qty,
                      color: getRandomColor()
                  });
              }
          }
      } else {
          const firstVal = parseFloat(parts[0]?.replace(',', '.'));

          if (!isNaN(firstVal) && parts.length >= 2) {
            newPieces.push({
              length: firstVal,
              width: parseFloat(parts[1]?.replace(',', '.')) || 0,
              quantity: parseInt(parts[2]) || 1,
              id: `Element-${index}`,
              color: getRandomColor()
            });
          }
      }
    });
    if (newPieces.length > 0) {
      onImport(newPieces);
    } else {
      alert("Nie udało się odczytać formatu pliku. Upewnij się, że to CSV rozdzielany średnikami.");
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2 text-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <h2 className="font-semibold text-sm uppercase tracking-wider">Formatki ({pieces.length})</h2>
        </div>

        <div className="flex gap-2">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.txt"
                onChange={handleFileUpload}
            />

            {pieces.length > 0 && (
                <button
                    onClick={onClear}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-2 py-1 rounded font-medium transition-colors flex items-center gap-1"
                    title="Usuń wszystkie formatki"
                >
                    <Eraser size={14} /> Wyczyść
                </button>
            )}

            <button
            onClick={() => fileInputRef.current.click()}
            className="text-xs bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-2 py-1 rounded font-medium transition-colors flex items-center gap-1"
            >
            <FileSpreadsheet size={14} /> Import
            </button>

            <button
            onClick={onAdd}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium transition-colors flex items-center gap-1"
            >
            <Plus size={14} /> Dodaj
            </button>
        </div>
      </div>

      <div className="space-y-2">
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
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {pieces.map((piece) => (
              <div key={piece.id} className="grid grid-cols-12 gap-2 items-center group animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="col-span-4 relative">
                    <input
                      type="number"
                      placeholder="L"
                      value={piece.length}
                      onChange={(e) => onUpdate(piece.id, { length: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
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
      </div>
    </section>
  );
}