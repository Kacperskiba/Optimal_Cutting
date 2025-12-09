import { BarChart3, TrendingUp, Scissors, Trash2 } from 'lucide-react';

export function ResultsPanel({ result, config }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-700" />
        <h2 className="text-gray-900 font-medium">Optimization Results</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-blue-900 text-sm font-medium">Plates Needed</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{result.totalPlates}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-900 text-sm font-medium">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{result.efficiency.toFixed(1)}%</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="w-4 h-4 text-purple-600" />
            <span className="text-purple-900 text-sm font-medium">Total Cuts</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{result.totalCuts}</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-orange-600" />
            <span className="text-orange-900 text-sm font-medium">Total Waste</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{result.totalWaste.toFixed(0)} mm²</div>
        </div>
      </div>
    </div>
  );
}