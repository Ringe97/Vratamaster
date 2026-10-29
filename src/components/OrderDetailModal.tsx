import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MapPin, 
  Calendar, 
  Copy, 
  CheckCheck, 
  Edit3, 
  Trash2, 
  DoorClosed, 
  Printer, 
  FileText,
  DollarSign,
  ArrowRight,
  Check,
  RotateCcw,
  Compass,
  Ruler,
  Camera,
  Eye
} from 'lucide-react';
import { WorkOrder, OrderPhase } from '../types';
import { formatCurrency, getPhaseLabel, generateViberOrderSummary } from '../utils/orderUtils';

interface OrderDetailModalProps {
  order: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (order: WorkOrder) => void;
  onDelete: (orderId: string) => void;
  onUpdatePhase: (orderId: string, phase: OrderPhase) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdatePhase
}) => {
  const [copied, setCopied] = useState(false);
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const phaseInfo = getPhaseLabel(order.phase);
  const cleanPhone = order.phone.replace(/\s+/g, '');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address}, ${order.city}`)}`;
  const totalDoorsCount = order.doors.reduce((acc, d) => acc + (d.quantity || 1), 0);

  const handleCopyViber = () => {
    const text = generateViberOrderSummary(order);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[95vh] sm:max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800">
        
        {/* Mobile Sheet Handle */}
        <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {order.orderNumber}
              </h2>
              <div className={`px-2 py-0.5 rounded-full text-xs font-bold border ${phaseInfo.badgeBg} ${phaseInfo.badgeBorder}`}>
                {phaseInfo.title}
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{order.clientName} • {order.city}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              title="Štampaj radni list"
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 space-y-5 flex-1">
          
          {/* Quick Contact & Navigation Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">Klijent</span>
                <h3 className="text-lg font-bold">{order.clientName}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{order.address}, {order.city}</span>
                </p>
              </div>
            </div>

            {/* Quick Touch Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${cleanPhone}`}
                className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>Pozovi ({order.phone})</span>
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-600 transition-all"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Navigacija (Mape)</span>
              </a>
            </div>
          </div>

          {/* Phase Management Controller */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              Upravljanje Fazom Radnog Naloga
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onUpdatePhase(order.id, 'zakazano_merenje')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  order.phase === 'zakazano_merenje' || order.phase === ('merenje' as any)
                    ? 'bg-sky-500 text-white border-sky-600 shadow-sm ring-2 ring-sky-400/30'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                }`}
              >
                1. Zakazano
              </button>

              <button
                type="button"
                onClick={() => onUpdatePhase(order.id, 'uzete_mere')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  order.phase === 'uzete_mere' || order.phase === ('priprema' as any)
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-2 ring-amber-400/30'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                }`}
              >
                2. Uzete mere
              </button>

              <button
                type="button"
                onClick={() => onUpdatePhase(order.id, 'montirano')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  order.phase === 'montirano'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400/30'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                }`}
              >
                3. Montirano
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 italic">
              {phaseInfo.description}
            </p>
          </div>

          {/* Dates Strip */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>Datum Merenja</span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {order.measurementDate || 'Nije definisano'}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Termin Montaže</span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {order.installationDate || 'Čeka se termin'}
              </span>
            </div>
          </div>

          {/* DOORS DETAILED SPECIFICATION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <DoorClosed className="w-4 h-4 text-amber-500" />
                <span>Specifikacija Vrata ({totalDoorsCount} kom)</span>
              </div>
            </div>

            {order.doors.length === 0 ? (
              <div className="bg-sky-50/80 dark:bg-sky-950/40 p-4 rounded-2xl border border-sky-200 dark:border-sky-900/60 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/70 text-sky-600 dark:text-sky-300 flex items-center justify-center mx-auto">
                  <Ruler className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-sky-900 dark:text-sky-200">
                  Dimenzije još nisu uzete (Zakazano merenje na terenu)
                </h4>
                <p className="text-xs text-sky-700 dark:text-sky-300 max-w-sm mx-auto">
                  Klijent je evidentiran. Kada odete na adresu klijenta, unesite tačne dimenzije i nalog će preći u fazu <strong>Uzete mere</strong>.
                  {order.estimatedDoorsCount ? ` Okvirna procena: ~${order.estimatedDoorsCount} kom.` : ''}
                </p>
                <button
                  type="button"
                  onClick={() => onEdit(order)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Unesi dimenzije vrata</span>
                </button>
              </div>
            ) : (
            <div className="space-y-3">
              {order.doors.map((door, idx) => (
                <div 
                  key={door.id || idx}
                  className="bg-white dark:bg-zinc-800/70 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-2.5"
                >
                  {/* Top info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {door.roomName}
                      </h4>
                      {door.quantity > 1 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs">
                          {door.quantity}x kom
                        </span>
                      )}
                    </div>

                    {/* Smer otvaranja Badge */}
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 border ${
                      door.openingDirection === 'L'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}>
                      <span>{door.openingDirection === 'L' ? '⬅️ LEVO (L)' : 'DESNO (D) ➡️'}</span>
                    </div>
                  </div>

                  {/* Model & Decor */}
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{door.model}</span>
                    <span className="mx-1.5">•</span>
                    <span className="text-zinc-500">{door.decor}</span>
                  </div>

                  {/* Dimensions Grid (Širina x Visina x Zid) */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Širina</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{door.width}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Visina</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{door.height}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Debljina zida</span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{door.wallThickness}</span>
                    </div>
                  </div>

                  {/* Hardware & threshold */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 pt-1">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      Brava: <strong className="text-zinc-800 dark:text-zinc-200">{door.lockType}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      Prag: <strong className="text-zinc-800 dark:text-zinc-200">{door.threshold}</strong>
                    </span>
                    {door.unitPrice ? (
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        Cena: <strong className="text-zinc-800 dark:text-zinc-200">{door.unitPrice} {order.currency}</strong>
                      </span>
                    ) : null}
                  </div>

                  {door.notes && (
                    <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900/60">
                      <strong>Napomena:</strong> {door.notes}
                    </div>
                  )}

                </div>
              ))}
            </div>
            )}
          </div>

          {/* FINANCIALS BREAKDOWN */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span>Finansijski Pregled</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-zinc-600 dark:text-zinc-400">Ukupno ugovoreno:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                {formatCurrency(order.totalPrice, order.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-zinc-600 dark:text-zinc-400">Uplaćen avans:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(order.deposit, order.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Preostali dug za naplatu:</span>
              <span className={`text-base font-black ${
                order.remainingDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {order.remainingDebt > 0 ? formatCurrency(order.remainingDebt, order.currency) : 'Plaćeno 100% ✓'}
              </span>
            </div>
          </div>

          {/* INSTALLER NOTES */}
          {order.installerNotes && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/60">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">
                ⚠️ Napomene za Majstore & Montažu:
              </span>
              <p className="text-xs text-amber-950 dark:text-amber-200 whitespace-pre-wrap leading-relaxed">
                {order.installerNotes}
              </p>
            </div>
          )}

          {/* FIELD PHOTOS */}
          {order.photos && order.photos.length > 0 && (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>Fotografije sa Terena & Otvori ({order.photos.length})</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                {order.photos.map((photo, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => setActivePhotoPreview(photo)}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-900 cursor-pointer shadow-xs active:scale-95 transition-transform"
                    title="Klikni za uvećan prikaz"
                  >
                    <img
                      src={photo}
                      alt={`Slika ${pIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Eye className="w-5 h-5 drop-shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sticky Footer with safe area padding */}
        <div className="p-3.5 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] sm:pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2 shrink-0">
          
          <button
            onClick={handleCopyViber}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200'
            }`}
          >
            {copied ? <CheckCheck className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Kopirano u memoriju!' : 'Kopiraj za Viber'}</span>
          </button>

          <button
            onClick={() => onEdit(order)}
            className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Uredi</span>
          </button>

          <button
            onClick={() => {
              onDelete(order.id);
              onClose();
            }}
            title="Obriši nalog"
            className="p-3 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Fullscreen Photo Lightbox Preview */}
      {activePhotoPreview && (
        <div
          className="fixed inset-0 z-60 bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 touch-manipulation"
          onClick={() => setActivePhotoPreview(null)}
        >
          <button
            type="button"
            onClick={() => setActivePhotoPreview(null)}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-90 z-20 cursor-pointer transition-transform"
            title="Zatvori pregled"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activePhotoPreview}
            alt="Prikaz slike sa terena"
            className="max-w-full max-h-[88vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
