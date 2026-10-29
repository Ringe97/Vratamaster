import React from 'react';
import { Search, X, MapPin, Ruler, Wrench, CheckCircle, SlidersHorizontal } from 'lucide-react';
import { OrderPhase, WorkOrder } from '../types';

interface PhaseTabsProps {
  selectedPhase: OrderPhase | 'sve';
  onSelectPhase: (phase: OrderPhase | 'sve') => void;
  orders: WorkOrder[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  availableCities: string[];
}

export const PhaseTabs: React.FC<PhaseTabsProps> = ({
  selectedPhase,
  onSelectPhase,
  orders,
  searchQuery,
  onSearchChange,
  selectedCity,
  onSelectCity,
  availableCities
}) => {
  // Brojači po fazama
  const countZakazano = orders.filter(o => o.phase === 'zakazano_merenje' || o.phase === ('merenje' as any)).length;
  const countUzete = orders.filter(o => o.phase === 'uzete_mere' || o.phase === ('priprema' as any)).length;
  const countMontirano = orders.filter(o => o.phase === 'montirano').length;
  const countSve = orders.length;

  const isZakazanoSelected = selectedPhase === 'zakazano_merenje' || selectedPhase === ('merenje' as any);
  const isUzeteSelected = selectedPhase === 'uzete_mere' || selectedPhase === ('priprema' as any);
  const isMontiranoSelected = selectedPhase === 'montirano';

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200/90 dark:border-zinc-800 shadow-xs relative z-10 w-full max-w-full overflow-hidden">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-2.5 pb-2 space-y-2">
        
        {/* Search Bar on top */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pretraži kupce, adrese, telefone ili vrata..."
            className="w-full pl-9 pr-9 py-2 bg-zinc-100 dark:bg-zinc-800 text-sm rounded-xl border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="w-7 h-7 flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3 Main Phase Tabs (Mobile-optimized tactile buttons) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl select-none">
          
          {/* Faza 1: Zakazano merenje */}
          <button
            type="button"
            onClick={() => onSelectPhase('zakazano_merenje')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative active:scale-98 ${
              isZakazanoSelected
                ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-sm font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] sm:text-xs">
              <Ruler className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">1. Zakazano</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isZakazanoSelected
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {countZakazano}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-normal truncate">Čeka teren</span>
          </button>

          {/* Faza 2: Uzete mere */}
          <button
            type="button"
            onClick={() => onSelectPhase('uzete_mere')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative active:scale-98 ${
              isUzeteSelected
                ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] sm:text-xs">
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2. Uzete mere</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isUzeteSelected
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {countUzete}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-normal truncate">Čeka montažu</span>
          </button>

          {/* Faza 3: Montirano */}
          <button
            type="button"
            onClick={() => onSelectPhase('montirano')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative active:scale-98 ${
              isMontiranoSelected
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] sm:text-xs">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">3. Montirano</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isMontiranoSelected
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {countMontirano}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-normal truncate">Završeno</span>
          </button>

        </div>

        {/* City Filter & "Sve faze" option */}
        <div className="flex items-center justify-between gap-2 pt-0.5 overflow-x-auto no-scrollbar text-xs touch-pan-x">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onSelectPhase('sve')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedPhase === 'sve'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Sve faze ({countSve})</span>
            </button>
            <div className="h-3.5 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-0.5"></div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 shrink-0 no-scrollbar">
            <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
              <MapPin className="w-3 h-3" /> Grad:
            </span>
            <button
              onClick={() => onSelectCity('SVI')}
              className={`px-2 py-0.8 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCity === 'SVI'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Svi
            </button>
            {availableCities.map(city => (
              <button
                key={city}
                onClick={() => onSelectCity(city)}
                className={`px-2 py-0.8 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedCity === city
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
