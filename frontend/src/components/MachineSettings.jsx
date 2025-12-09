import { Settings } from 'lucide-react';

export function MachineSettings({ config, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-700" />
        <h2 className="text-gray-900 font-medium">Machine Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2 text-sm font-medium">
            Saw Blade Width (Kerf)
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
            Source Plate Length
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
            Plate Width
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