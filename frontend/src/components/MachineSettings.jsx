import { Settings, Cpu, Ruler, Disc, RotateCw } from 'lucide-react';

export function MachineSettings({ config, onChange }) {

  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value === '' ? '' : value });
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <Settings className="w-4 h-4" />
        <h2 className="font-semibold text-sm uppercase tracking-wider">Konfiguracja</h2>
      </div>

      <div className="space-y-4">

        <div className={`p-3 rounded-lg border transition-colors ${config.allowRotation ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
             <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <RotateCw size={14} /> Obracanie (Słoje)
                </label>
                <button
                  onClick={() => handleChange('allowRotation', !config.allowRotation)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.allowRotation ? 'bg-blue-600 focus:ring-blue-500' : 'bg-slate-300 focus:ring-slate-400'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${config.allowRotation ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
             </div>
             <p className="text-[11px] leading-tight text-slate-500">
                {config.allowRotation
                  ? "Włączone. Płyta jednolita (MDF, Uni). Największa oszczędność."
                  : "Wyłączone. Zachowuje kierunek słojów (Drewno). Formatki muszą być zgodne z Długością płyty."}
             </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-500 mb-1.5 block flex items-center gap-1">
            <Cpu size={12} /> Algorytm
          </label>
          <select
            value={config.algorithm}
            onChange={(e) => handleChange('algorithm', e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2"
          >
            <option value="strips">GuillotineBlsfLas</option>
            <option value="guillotine">GuillotineBssfSas</option>
            <option value="nesting">MaxRectsBl</option>
            <option value="simple">SkylineBl</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Dł. Płyty (mm) <span className="text-amber-500 font-normal">{!config.allowRotation && "↕ Słój"}</span></label>
            <div className="relative">
              <input
                type="number"
                value={config.plateLength}
                onChange={(e) => handleChange('plateLength', e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <Ruler className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Szer. Płyty (mm)</label>
            <div className="relative">
              <input
                type="number"
                value={config.plateWidth}
                onChange={(e) => handleChange('plateWidth', e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <Ruler className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 rotate-90" />
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100 mt-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Estymacja Czasu</h3>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Prędkość (m/min)</label>
                    <input
                        type="number"
                        value={config.cuttingSpeed || 20}
                        onChange={(e) => handleChange('cuttingSpeed', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Manipulacja (s)</label>
                    <input
                        type="number"
                        value={config.handlingTime || 5}
                        onChange={(e) => handleChange('handlingTime', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Grubość cięcia (mm)</label>
          <div className="relative">
            <input
              type="number"
              value={config.sawWidth}
              onChange={(e) => handleChange('sawWidth', e.target.value)}
              className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <Disc className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </section>
  );
}