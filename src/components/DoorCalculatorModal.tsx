import React, { useState } from 'react';
import { X, Calculator, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DoorCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [openingWidth, setOpeningWidth] = useState<number>(90); // cm
  const [openingHeight, setOpeningHeight] = useState<number>(205); // cm
  const [wallThickness, setWallThickness] = useState<number>(14); // cm

  if (!isOpen) return null;

  // Izračunavanje preporučene širine krila
  // Obično otvor minus 8-10cm je širina krila vrata sa štokom
  let recommendedDoorLeaf = 80;
  let statusWidth = 'Normalan standardni otvor';

  if (openingWidth >= 68 && openingWidth <= 73) {
    recommendedDoorLeaf = 60;
  } else if (openingWidth >= 78 && openingWidth <= 83) {
    recommendedDoorLeaf = 70;
  } else if (openingWidth >= 88 && openingWidth <= 93) {
    recommendedDoorLeaf = 80;
  } else if (openingWidth >= 98 && openingWidth <= 103) {
    recommendedDoorLeaf = 90;
  } else {
    // Vanstandardni
    if (openingWidth < 68) {
      recommendedDoorLeaf = 60;
      statusWidth = 'Otvor je uži od standarda! Potrebno sužavanje ili štemovanje zida.';
    } else if (openingWidth > 103) {
      recommendedDoorLeaf = 90;
      statusWidth = 'Otvor je širi od 103cm! Potrebno dopunjavanje otvora ili dvokrilna vrata.';
    } else {
      recommendedDoorLeaf = Math.round((openingWidth - 10) / 10) * 10;
      statusWidth = `Nestandardan otvor (${openingWidth}cm). Preporučuje se krilo ${recommendedDoorLeaf}cm uz šira pervajz lajsne (min 7-8cm).`;
    }
  }

  // Preporuka za štok prema debljini zida
  let jambRecommendation = 'Standardni štok (10 - 15 cm)';
  let jambWarning = false;

  if (wallThickness <= 9) {
    jambRecommendation = 'Tanak zid (< 10cm). Potreban podrezani štok ili dodatne lajsne.';
    jambWarning = true;
  } else if (wallThickness <= 15) {
    jambRecommendation = 'Standardni štok sa plivajućim pervajzom (pokriva 10-15cm bez doplate).';
  } else if (wallThickness <= 25) {
    jambRecommendation = `Zid je ${wallThickness}cm. Obavezno naručiti ŠTOK SA PROŠIRENJEM (+10cm do 25cm).`;
    jambWarning = true;
  } else {
    jambRecommendation = `Zid je ${wallThickness}cm (debeo zid). Naručiti specijalno dvostruko proširenje štoka!`;
    jambWarning = true;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom duration-200">
        
        {/* Mobile Sheet Handle */}
        <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Kalkulator Mera i Štoka</h2>
              <p className="text-xs text-zinc-500">Brza provera zazora i proširenja</p>
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
          <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 flex gap-2.5 text-xs text-blue-800 dark:text-blue-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Unesite izmerene dimenzije građevinskog otvora u zidu (od zida do zida) i debljinu zida.</span>
          </div>

          {/* Input fields */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Širina otvora
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={openingWidth}
                  onChange={(e) => setOpeningWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 text-center text-lg font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-2 bottom-2 text-[10px] text-zinc-400">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Visina otvora
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={openingHeight}
                  onChange={(e) => setOpeningHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-center text-lg font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-2 bottom-2 text-[10px] text-zinc-400">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Debljina zida
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={wallThickness}
                  onChange={(e) => setWallThickness(Number(e.target.value))}
                  className="w-full px-3 py-2 text-center text-lg font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-2 bottom-2 text-[10px] text-zinc-400">cm</span>
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="pt-1">
            <span className="text-[11px] font-medium text-zinc-500 block mb-1.5">Brzi standardi:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Kupatilo 70', w: 70, h: 205, t: 12 },
                { label: 'Soba 80', w: 80, h: 205, t: 15 },
                { label: 'Dnevna 90', w: 90, h: 205, t: 18 },
                { label: 'Debeo zid 25', w: 90, h: 205, t: 25 },
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setOpeningWidth(p.w);
                    setOpeningHeight(p.h);
                    setWallThickness(p.t);
                  }}
                  className="px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors font-medium"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-zinc-50 dark:bg-zinc-800/70 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400">Preporuka za poručivanje</h3>

            <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Nazivna širina krila:</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-md">
                {recommendedDoorLeaf} cm
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Potreban zazor za penu:</span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                1.5 - 2.5 cm sa svake strane
              </span>
            </div>

            <div className="py-2 border-b border-zinc-200 dark:border-zinc-700">
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Pervajz i štok za zid {wallThickness} cm:</div>
              <div className={`text-xs font-medium flex items-start gap-1.5 ${jambWarning ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                {jambWarning ? <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />}
                <span>{jambRecommendation}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
              {statusWidth}
            </div>
          </div>

          {/* Info guide */}
          <div className="text-[11px] text-zinc-500 space-y-1">
            <p><strong>Pravilo smera:</strong> Stanite sa strane na koju se vrata otvaraju prema vama. Ako su šarke sa leve strane - vrata su <strong>LEVA</strong>. Ako su sa desne - vrata su <strong>DESNA</strong>.</p>
          </div>
        </div>

        {/* Footer with safe area padding */}
        <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:pb-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white font-bold rounded-xl text-sm transition-colors active:scale-98"
          >
            Zatvori kalkulator
          </button>
        </div>

      </div>
    </div>
  );
};
