import { Box, Percent, Scissors, Recycle, Clock } from 'lucide-react';

export function ResultsPanel({ result }) {
  // Komponent pomocniczy dla pojedynczej karty
  const StatCard = ({ icon: Icon, label, value, subtext, colorClass, bgClass }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-2 rounded-lg ${bgClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard
        icon={Box}
        label="Potrzebne Płyty"
        value={result.totalPlates}
        colorClass="text-blue-600"
        bgClass="bg-blue-50"
      />
      <StatCard
        icon={Percent}
        label="Wydajność"
        value={`${result.efficiency.toFixed(1)}%`}
        colorClass="text-emerald-600"
        bgClass="bg-emerald-50"
      />
      <StatCard
        icon={Scissors}
        label="Liczba Cięć"
        value={result.totalCuts}
        subtext="Elementów do wycięcia"
        colorClass="text-violet-600"
        bgClass="bg-violet-50"
      />
      <StatCard
        icon={Recycle}
        label="Odpady"
        value={`${(result.totalWaste / 1000000).toFixed(2)} m²`}
        subtext="Powierzchnia strat"
        colorClass="text-amber-600"
        bgClass="bg-amber-50"
      />
        <StatCard
        icon={Clock}
        label="Szacowany Czas"
        value={result.estimatedTime}
        subtext="Cięcie + Obsługa"
        colorClass="text-pink-600"
        bgClass="bg-pink-50"
      />
    </div>

  );
}