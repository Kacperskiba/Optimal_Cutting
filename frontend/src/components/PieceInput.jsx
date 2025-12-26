import { Plus, X, Ruler } from 'lucide-react';

export function PieceInput({ pieces, onAdd, onUpdate, onRemove }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-gray-700" />
          <h2 className="text-gray-900 font-medium">Lista Formatek</h2>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Dodaj
        </button>
      </div>

      <div className="space-y-3">
        {pieces.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">Brak elementów na liście</p>
        ) : (
          pieces.map((piece) => (
            <div key={piece.id} className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={piece.length || ''}
                  onChange={(e) => onUpdate(piece.id, { length: parseFloat(e.target.value) || 0 })}
                  placeholder="Dł. (mm)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  step="10"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={piece.width || ''}
                  onChange={(e) => onUpdate(piece.id, { width: parseFloat(e.target.value) || 0 })}
                  placeholder="Szer. (mm)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  step="10"
                  min="0"
                />
              </div>
              <div className="w-20">
                <input
                  type="number"
                  value={piece.quantity || ''}
                  onChange={(e) => onUpdate(piece.id, { quantity: parseInt(e.target.value) || 0 })}
                  placeholder="Il."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="1"
                />
              </div>
              <button
                onClick={() => onRemove(piece.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}