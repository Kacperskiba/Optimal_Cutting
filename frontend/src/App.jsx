import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CuttingVisualizer } from './components/CuttingVisualizer';
import { MachineSettings } from './components/MachineSettings';
import { PieceInput } from './components/PieceInput';
import { ResultsPanel } from './components/ResultsPanel';
import { optimizeCutsRequest } from './api/client';

export default function App() {
  // Domyślne wymiary np. dla standardowej płyty meblowej 2800x2070
  const [machineConfig, setMachineConfig] = useState({
    sawWidth: 3,       // Rzaz
    plateLength: 2800, // Długość płyty
    plateWidth: 2070,
    algorithm: 'guillotine',  // Szerokość płyty
  });

  const [pieces, setPieces] = useState([
    { id: '1', length: 800, width: 400, quantity: 3 },
    { id: '2', length: 600, width: 300, quantity: 5 },
    { id: '3', length: 1200, width: 500, quantity: 2 },
  ]);

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const optimizationResult = await optimizeCutsRequest(pieces, machineConfig);
      setResult(optimizationResult);
    } catch (err) {
      setError("Nie udało się połączyć z serwerem. Czy backend FastAPI jest uruchomiony?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPiece = () => {
    const newPiece = {
      id: Date.now().toString(),
      length: 0,
      width: 0,
      quantity: 1,
    };
    setPieces([...pieces, newPiece]);
  };

  const handleUpdatePiece = (id, updates) => {
    setPieces(pieces.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleRemovePiece = (id) => {
    setPieces(pieces.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Optymalizator Rozkroju Płyt</h1>
          <p className="text-gray-600">
            Skonfiguruj wymiary płyty matki i dodaj formatki do wycięcia, aby uzyskać optymalny schemat cięcia.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lewy panel - Ustawienia i Lista */}
          <div className="lg:col-span-1 space-y-6">
            <MachineSettings
              config={machineConfig}
              onChange={setMachineConfig}
            />

            <PieceInput
              pieces={pieces}
              onAdd={handleAddPiece}
              onUpdate={handleUpdatePiece}
              onRemove={handleRemovePiece}
            />

            <div className="space-y-3">
              <button
                onClick={handleOptimize}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Obliczanie...
                  </>
                ) : (
                  'Oblicz Rozkrój'
                )}
              </button>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Prawy panel - Wizualizacja i Wyniki */}
          <div className="lg:col-span-2 space-y-6">
            {result ? (
              <>
                <ResultsPanel result={result} config={machineConfig} />
                <CuttingVisualizer
                  result={result}
                  config={machineConfig}
                />
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center h-full flex flex-col justify-center items-center text-gray-500">
                <p>Wprowadź dane i kliknij "Oblicz Rozkrój"</p>
                <p className="text-sm mt-2">Wyniki zostaną wygenerowane przez serwer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}