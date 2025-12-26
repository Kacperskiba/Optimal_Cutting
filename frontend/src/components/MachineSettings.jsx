import { Settings, Cpu } from 'lucide-react'; // Dodaliśmy ikonkę Cpu dla algorytmu

export function MachineSettings({ config, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-700" />
        <h2 className="text-gray-900 font-medium">Ustawienia Maszyny</h2>
      </div>

      <div className="space-y-4">
        {/* --- NOWE POLE: WYBÓR ALGORYTMU --- */}
        <div>
          <label className="block text-gray-700 mb-2 text-sm font-medium">
            Algorytm Cięcia
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <select
                  value={config.algorithm}
                  onChange={(e) => handleChange('algorithm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="guillotine">Gilotynowy (Piła Formatowa)</option>
                  <option value="nesting">Nesting (CNC / Laser)</option>
                  <option value="simple">Prosty (Półkowy)</option>
                </select>
                <Cpu className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {config.algorithm === 'guillotine' && "Optymalny dla piły. Cięcia przelotowe od krawędzi do krawędzi."}
            {config.algorithm === 'nesting' && "Największa oszczędność. Skomplikowane kształty (wymaga CNC)."}
            {config.algorithm === 'simple' && "Układa elementy prostymi warstwami. Łatwe do pocięcia."}
          </p>
        </div>

        <hr className="border-gray-100 my-4"/>

        {/* Reszta pól (Rzaz, Wymiary) bez zmian */}
        <div>
          <label className="block text-gray-700 mb-2 text-sm font-medium">
            Grubość Tarczy Piły (Rzaz)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.sawWidth}
              onChange={(e) => handleChange('sawWidth', parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="0"
            />
            <span className="text-gray-600">mm</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2 text-sm font-medium">
            Długość Płyty
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.plateLength}
              onChange={(e) => handleChange('plateLength', parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="10"
              min="0"
            />
            <span className="text-gray-600">mm</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2 text-sm font-medium">
            Szerokość Płyty
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.plateWidth}
              onChange={(e) => handleChange('plateWidth', parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="10"
              min="0"
            />
            <span className="text-gray-600">mm</span>
          </div>
        </div>
      </div>
    </div>
  );
}