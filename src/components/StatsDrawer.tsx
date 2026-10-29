import React, { useRef } from 'react';
import { X, BarChart2, Download, Upload, RotateCcw, Building, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { WorkOrder } from '../types';
import { formatCurrency, resetStoredOrders } from '../utils/orderUtils';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: WorkOrder[];
  onOrdersUpdated: (orders: WorkOrder[]) => void;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({
  isOpen,
  onClose,
  orders,
  onOrdersUpdated
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Calculatings
  const totalOrders = orders.length;
  const countZakazano = orders.filter(o => o.phase === 'zakazano_merenje' || o.phase === ('merenje' as any)).length;
  const countUzete = orders.filter(o => o.phase === 'uzete_mere' || o.phase === ('priprema' as any)).length;
  const countMontirano = orders.filter(o => o.phase === 'montirano').length;

  const totalContracted = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalDeposits = orders.reduce((sum, o) => sum + (o.deposit || 0), 0);
  const totalPendingDebt = orders.reduce((sum, o) => sum + (o.remainingDebt || 0), 0);

  // Doors count
  const totalDoors = orders.reduce((sum, o) => sum + o.doors.reduce((dSum, d) => dSum + (d.quantity || 1), 0), 0);

  // Cities count
  const cityCounts = orders.reduce((acc, o) => {
    acc[o.city] = (acc[o.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vratamaster-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onOrdersUpdated(imported);
          onClose();
        }
      } catch (err) {
        console.error('Error importing backup:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Da li ste sigurni da želite da vratite početne demo podatke? Svi uneti nalozi biće zamenjeni primerima.')) {
      const reset = resetStoredOrders();
      onOrdersUpdated(reset.orders);
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom duration-200">
        
        {/* Mobile Sheet Handle */}
        <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Poslovni Pregled & Podaci</h2>
              <p className="text-xs text-zinc-500">Statistika montaže i rezervne kopije</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl">
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block">
                Za naplatu (Teren):
              </span>
              <span className="text-lg font-black text-amber-950 dark:text-amber-100">
                {formatCurrency(totalPendingDebt, 'EUR')}
              </span>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                Uplaćeni avansi:
              </span>
              <span className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                {formatCurrency(totalDeposits, 'EUR')}
              </span>
            </div>
          </div>

          {/* Breakdown by Phases */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              Statusi Radnih Naloga ({totalOrders})
            </span>

            <div className="flex items-center justify-between text-xs py-1 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" />
                <span>1. Zakazano merenje:</span>
              </div>
              <strong className="text-zinc-900 dark:text-zinc-100">{countZakazano} naloga</strong>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>2. Uzete mere:</span>
              </div>
              <strong className="text-zinc-900 dark:text-zinc-100">{countUzete} naloga</strong>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>3. Montirano:</span>
              </div>
              <strong className="text-zinc-900 dark:text-zinc-100">{countMontirano} naloga</strong>
            </div>
          </div>

          {/* Breakdown by City */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-amber-500" />
              <span>Nalozi po gradovima</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(cityCounts).map(([city, count]) => (
                <div 
                  key={city}
                  className="px-2.5 py-1 bg-white dark:bg-zinc-900 rounded-lg text-xs border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5"
                >
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{city}:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Backup & Data Management */}
          <div className="pt-2 space-y-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              Rezervna Kopija & Sigurnost Podataka
            </span>

            <p className="text-xs text-zinc-500">
              Svi podaci se automatski čuvaju na vašem telefonu (localStorage). Možete skinuti kopiju u JSON formatu ili vratiti ranije sačuvane naloge.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>Preuzmi Backup</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Uvezi Backup</span>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 text-xs text-zinc-400 hover:text-rose-500 flex items-center justify-center gap-1 mt-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vrati početne demo podatke</span>
            </button>
          </div>

        </div>

        {/* Footer with safe area padding */}
        <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:pb-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-black dark:hover:bg-white rounded-xl text-sm font-bold active:scale-98 transition-all"
          >
            Zatvori
          </button>
        </div>

      </div>
    </div>
  );
};
