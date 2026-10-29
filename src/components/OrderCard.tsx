import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  ArrowRight, 
  Check, 
  Copy, 
  CheckCheck, 
  Calendar, 
  DoorClosed, 
  ChevronRight, 
  RotateCcw, 
  Ruler,
  Camera
} from 'lucide-react';
import { WorkOrder, OrderPhase } from '../types';
import { formatCurrency, getPhaseLabel, generateViberOrderSummary } from '../utils/orderUtils';

interface OrderCardProps {
  order: WorkOrder;
  onOpenDetails: (order: WorkOrder) => void;
  onEdit: (order: WorkOrder) => void;
  onUpdatePhase: (orderId: string, newPhase: OrderPhase) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onOpenDetails,
  onEdit,
  onUpdatePhase
}) => {
  const [copied, setCopied] = useState(false);
  const phaseInfo = getPhaseLabel(order.phase);
  const totalDoorsCount = order.doors.reduce((acc, d) => acc + (d.quantity || 1), 0);

  const handleCopyViber = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateViberOrderSummary(order);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const cleanPhone = order.phone.replace(/\s+/g, '');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address}, ${order.city}`)}`;

  return (
    <div 
      onClick={() => onOpenDetails(order)}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer active:scale-[0.99] touch-manipulation select-none"
    >
      {/* Top Strip: Order # and Phase Badge */}
      <div className="px-3.5 sm:px-4 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
            {order.orderNumber}
          </span>
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600">•</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">
            {order.city}
          </span>
        </div>

        {/* Phase Pill */}
        <div className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold border flex items-center gap-1.5 shrink-0 ${phaseInfo.badgeBg} ${phaseInfo.badgeBorder}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span>{phaseInfo.title}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-3.5 sm:p-4 space-y-2.5">
        
        {/* Client Name & Quick Call / Maps actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {order.clientName}
            </h3>
            
            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span className="truncate">{order.address}, {order.city}</span>
            </div>
          </div>

          {/* Direct Actions: Call & Map with comfortable 44px touch targets */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <a
              href={`tel:${cleanPhone}`}
              title="Pozovi klijenta"
              className="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            >
              <Phone className="w-4 h-4 fill-white" />
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Navigacija na mapi"
              className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center hover:bg-blue-100 active:scale-90 transition-transform"
            >
              <MapPin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Doors Items Summary */}
        {order.doors.length === 0 ? (
          <div className="bg-sky-50/70 dark:bg-sky-950/40 rounded-xl p-2.5 border border-sky-200/60 dark:border-sky-900/50">
            <div className="flex items-center justify-between text-xs font-semibold text-sky-800 dark:text-sky-300">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Zakazano merenje na terenu</span>
              </div>
              {order.estimatedDoorsCount ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-200/70 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
                  Okvirno ~ {order.estimatedDoorsCount} kom
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-2.5 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              <div className="flex items-center gap-1.5">
                <DoorClosed className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Vrata ({totalDoorsCount} kom):</span>
              </div>
              <span className="text-[11px] font-normal text-zinc-500">
                {order.doors.length} {order.doors.length === 1 ? 'pozicija' : 'pozicije'}
              </span>
            </div>

            <div className="space-y-1">
              {order.doors.slice(0, 3).map((door, idx) => (
                <div key={door.id || idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between gap-1">
                  <span className="truncate flex items-center gap-1 min-w-0">
                    <strong className="text-zinc-800 dark:text-zinc-200 font-semibold shrink-0">{door.roomName}:</strong>
                    <span className="truncate">{door.width && door.height ? `${door.width} x ${door.height}` : 'Mere u toku'} ({door.model || 'Sobna vrata'})</span>
                  </span>
                  {door.openingDirection && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 shrink-0 ml-1">
                      {door.openingDirection === 'L' ? 'L' : 'D'}
                    </span>
                  )}
                </div>
              ))}
              {order.doors.length > 3 && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-0.5">
                  + još {order.doors.length - 3} komada...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dates preview & Field Photos badge */}
        {(order.measurementDate || order.installationDate || (order.photos && order.photos.length > 0)) && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <div className="flex flex-wrap items-center gap-3">
              {order.measurementDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  <span>Merenje: <strong className="text-zinc-800 dark:text-zinc-200">{order.measurementDate}</strong></span>
                </div>
              )}
              {order.installationDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Montaža: <strong className="text-zinc-800 dark:text-zinc-200">{order.installationDate}</strong></span>
                </div>
              )}
            </div>

            {order.photos && order.photos.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded-lg shrink-0">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>{order.photos.length} {order.photos.length === 1 ? 'slika' : 'slike'}</span>
              </span>
            )}
          </div>
        )}

        {/* Financials Bar */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">Ukupan iznos</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(order.totalPrice, order.currency)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">Preostali dug</span>
            <span className={`text-sm font-extrabold ${
              order.remainingDebt > 0 
                ? 'text-rose-600 dark:text-rose-400' 
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {order.remainingDebt > 0 ? formatCurrency(order.remainingDebt, order.currency) : 'Plaćeno ✓'}
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Action Footer - 1-click mobile phase switches with at least 40px touch targets */}
      <div 
        className="px-3.5 sm:px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Share Viber button */}
        <button
          onClick={handleCopyViber}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
            copied
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-zinc-200/80 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 text-zinc-700'
          }`}
          title="Kopiraj specifikaciju za Viber / WhatsApp"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Kopirano!' : 'Za Viber'}</span>
        </button>

        {/* Phase transition action */}
        <div className="flex items-center gap-1.5">
          {(order.phase === 'zakazano_merenje' || order.phase === ('merenje' as any)) && (
            <button
              onClick={() => onUpdatePhase(order.id, 'uzete_mere')}
              className="flex items-center gap-1 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition-all active:scale-95"
              title="Prebaci u Fazu 2 kada odeš na teren i uneseš dimenzije"
            >
              <span>Uzete mere</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {(order.phase === 'uzete_mere' || order.phase === ('priprema' as any)) && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdatePhase(order.id, 'zakazano_merenje')}
                title="Vrati u zakazano merenje"
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-200/50 active:scale-90"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdatePhase(order.id, 'montirano')}
                className="flex items-center gap-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all active:scale-95"
                title="Završi posao i označi vrata kao montirana"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Montirano</span>
              </button>
            </div>
          )}

          {order.phase === 'montirano' && (
            <button
              onClick={() => onUpdatePhase(order.id, 'uzete_mere')}
              title="Vrati nalog u rad (čeka montažu)"
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vrati u rad</span>
            </button>
          )}

          <button
            onClick={() => onOpenDetails(order)}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg active:scale-90"
            title="Otvori detalje"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
