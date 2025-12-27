import { useState } from 'react';
import { Loader2, LayoutDashboard } from 'lucide-react';
import { CuttingVisualizer } from './components/CuttingVisualizer';
import { MachineSettings } from './components/MachineSettings';
import { PieceInput } from './components/PieceInput';
import { ResultsPanel } from './components/ResultsPanel';
import { optimizeCutsRequest } from './api/client';

export default function App() {
  // 1. Stan konfiguracji maszyny (wymiary, rzaz, algorytm, obracanie)
  const [machineConfig, setMachineConfig] = useState({
    sawWidth: 3,
    plateLength: 2800,
    plateWidth: 2070,
    algorithm: 'guillotine', // Domyślny algorytm
    allowRotation: true,     // Domyślnie pozwalamy obracać (chyba że słoje)
  });

  // 2. Stan listy formatek (przykładowe dane na start)
  const [pieces, setPieces] = useState([
    { id: '1', length: 800, width: 400, quantity: 3 },
    { id: '2', length: 600, width: 300, quantity: 5 },
  ]);

  // 3. Stany wyników i UI
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- KOMUNIKACJA Z API ---
  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const optimizationResult = await optimizeCutsRequest(pieces, machineConfig);
      setResult(optimizationResult);
    } catch (err) {
      console.error(err);
      setError("Błąd połączenia z serwerem. Upewnij się, że backend FastAPI działa.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ZARZĄDZANIE FORMATKAMI ---

  // Dodanie pustego wiersza
  const handleAddPiece = () => {
    const newPiece = { id: Date.now().toString(), length: '', width: '', quantity: 1 };
    setPieces([...pieces, newPiece]);
  };

  // Aktualizacja konkretnego pola
  const handleUpdatePiece = (id, updates) => {
    setPieces(pieces.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Usuwanie wiersza
  const handleRemovePiece = (id) => {
    setPieces(pieces.filter(p => p.id !== id));
  };

  // IMPORT CSV (Kluczowa funkcja dla Twojego pytania)
  const handleImportPieces = (newPieces) => {
    // Dodajemy unikalne ID do zaimportowanych elementów, żeby React się nie gubił
    const piecesWithIds = newPieces.map((p, index) => ({
      ...p,
      id: `imported-${Date.now()}-${index}`
    }));

    // Decyzja: Czy czyścimy stare? Tutaj dodajemy nowe do istniejących (append).
    // Jeśli chcesz czyścić, użyj: setPieces(piecesWithIds);
    setPieces([...pieces, ...piecesWithIds]);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">

      {/* --- LEWY PANEL (SIDEBAR) --- */}
      <aside className="w-[400px] bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-10">

        {/* Nagłówek Sidebara */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Cut Optimizer</h1>
            <p className="text-xs text-slate-500">Panel Sterowania</p>
          </div>
        </div>

        {/* Przewijana zawartość formularzy */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-300">

          <MachineSettings
            config={machineConfig}
            onChange={setMachineConfig}
          />

          <hr className="border-slate-100" />

          <PieceInput
            pieces={pieces}
            onAdd={handleAddPiece}
            onUpdate={handleUpdatePiece}
            onRemove={handleRemovePiece}
            onImport={handleImportPieces} // <--- PRZEKAZANIE FUNKCJI IMPORTU
          />

        </div>

        {/* Stopka Sidebara z przyciskiem akcji */}
        <div className="p-5 border-t border-slate-200 bg-white">
          {error && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleOptimize}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Obliczanie...
                </>
            ) : (
                'Oblicz Rozkrój'
            )}
          </button>
        </div>
      </aside>

      {/* --- PRAWY PANEL (OBSZAR ROBOCZY) --- */}
      <main className="flex-1 overflow-y-auto p-8 relative bg-slate-100">
        <div className="max-w-6xl mx-auto space-y-6">

          {!result ? (
            // Stan pusty (przed obliczeniem)
            <div className="h-[80vh] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
              <LayoutDashboard size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Wprowadź dane i kliknij "Oblicz Rozkrój"</p>
              <p className="text-sm">Możesz też wgrać plik CSV z listą formatek</p>
            </div>
          ) : (
            // Wyniki
            <>
              <ResultsPanel result={result} />
              <CuttingVisualizer result={result} config={machineConfig} />
            </>
          )}

        </div>
      </main>
    </div>
  );
}