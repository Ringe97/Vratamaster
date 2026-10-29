import React from 'react';
import { DoorOpen, Plus, Calculator, BarChart3, Cloud, ChevronRight } from 'lucide-react';
import { WorkOrder, MainTab } from '../types';
import { formatCurrency } from '../utils/orderUtils';

interface HeaderProps {
  orders: WorkOrder[];
  clientsCount: number;
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onNewOrder: () => void;
  onOpenCalculator: () => void;
  onOpenStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  orders,
  clientsCount,
  activeTab,
  onSelectTab,
  onNewOrder,
  onOpenCalculator,
  onOpenStats
}) => {
  const activeOrders = orders.filter(o => o.phase !== 'montirano');
  const totalPendingDebt = activeOrders.reduce((sum, o) => sum + (o.remainingDebt || 0), 0);
  const totalDoors = orders.reduce((sum, o) => sum + o.doors.reduce((dSum, d) => dSum + (d.quantity || 1), 0), 0);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & title */}
          <div 
            onClick={() => onSelectTab('nalozi')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer active:scale-98 transition-transform select-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-inner font-black">
              <DoorOpen className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white">VrataMaster</span>
                <span className="px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                  PRO
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium">Nalozi & Baza Klijenata</p>
            </div>
          </div>

          {/* Quick Tools & Mobile Action Bar */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            
            {/* Mobile Teren dug quick chip (tappable to view stats) */}
            <button
              onClick={onOpenStats}
              title="Pregled duga za naplatu na terenu"
              className="sm:hidden px-2 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>Dug:</span>
              <strong className="text-amber-300">{formatCurrency(totalPendingDebt, 'EUR')}</strong>
            </button>

            {/* Drive Sync Quick Icon (Tablet & Desktop only; on mobile it is in bottom bar) */}
            <button
              onClick={() => onSelectTab('sifarnici')}
              title="Google Drive sinhronizacija i šifarnici"
              className="hidden sm:flex p-2 sm:px-2.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl text-xs font-semibold items-center gap-1.5 transition-all border border-slate-700 active:scale-95"
            >
              <Cloud className="w-4 h-4 text-blue-400" />
              <span className="hidden lg:inline">Drive Sync</span>
            </button>

            {/* Calculator (Desktop and tablet only; on mobile it is in bottom bar) */}
            <button
              onClick={onOpenCalculator}
              title="Kalkulator mera otvora i štoka"
              className="hidden sm:flex p-2 sm:px-2.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-semibold items-center gap-1.5 transition-all border border-slate-700 active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden md:inline">Kalkulator</span>
            </button>

            {/* Desktop Overview */}
            <button
              onClick={onOpenStats}
              title="Statistika i podaci"
              className="hidden sm:flex p-2 sm:px-2.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold items-center gap-1.5 transition-all border border-slate-700 active:scale-95"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Pregled</span>
            </button>

            {/* Novi Nalog Button */}
            <button
              onClick={onNewOrder}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">Novi Nalog</span>
              <span className="xs:hidden">Novi</span>
            </button>
          </div>

        </div>

        {/* Desktop / Tablet Navigation Tabs (Hidden on mobile to maximize viewport) */}
        <div className="hidden sm:flex mt-2.5 pt-2 border-t border-slate-800/80 items-center justify-between text-xs">
          <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => onSelectTab('nalozi')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'nalozi'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>Radni Nalozi</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'nalozi' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('klijenti')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'klijenti'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>Baza Klijenata</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'klijenti' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}>
                {clientsCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('sifarnici')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'sifarnici'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>Šifarnici & Drive</span>
            </button>
          </nav>

          <div className="flex items-center gap-1 text-amber-300 font-medium">
            <span className="text-[11px] text-slate-400">Teren dug:</span>
            <strong className="text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded text-xs">
              {formatCurrency(totalPendingDebt, 'EUR')}
            </strong>
          </div>
        </div>

        {/* Desktop Quick stats strip */}
        <div className="hidden sm:flex mt-3 pt-2.5 border-t border-slate-800/80 items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Aktivnih naloga: <strong className="text-white">{activeOrders.length}</strong></span>
            <span>•</span>
            <span>Vrata u evidenciji: <strong className="text-white">{totalDoors}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-amber-300 font-medium">
            <span>Za naplatu na terenu:</span>
            <strong className="text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded text-xs">
              {formatCurrency(totalPendingDebt, 'EUR')}
            </strong>
          </div>
        </div>

      </div>
    </header>
  );
};
