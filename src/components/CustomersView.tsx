import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  DoorClosed, 
  FilePlus, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  X, 
  Check, 
  Compass, 
  MessageSquare,
  Clock,
  CheckCircle2,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { Client, WorkOrder, OrderPhase } from '../types';
import { formatCurrency, getPhaseLabel } from '../utils/orderUtils';

interface CustomersViewProps {
  clients: Client[];
  orders: WorkOrder[];
  onNewOrderForClient: (client: Client) => void;
  onOpenOrderDetails: (order: WorkOrder) => void;
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  clients,
  orders,
  onNewOrderForClient,
  onOpenOrderDetails,
  onSaveClient,
  onDeleteClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('SVI');
  
  // Selected client for full profile view modal
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  
  // Add / Edit client modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('Niš');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Open add client modal
  const handleAddNewClient = () => {
    setEditingClient(null);
    setFormName('');
    setFormPhone('');
    setFormCity('Niš');
    setFormAddress('');
    setFormNotes('');
    setIsEditModalOpen(true);
  };

  // Open edit client modal
  const handleEditClient = (client: Client, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClient(client);
    setFormName(client.name);
    setFormPhone(client.phone);
    setFormCity(client.city);
    setFormAddress(client.address);
    setFormNotes(client.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Molimo unesite ime klijenta.');
      return;
    }

    const clientToSave: Client = {
      id: editingClient ? editingClient.id : 'cli-' + Date.now(),
      name: formName.trim(),
      phone: formPhone.trim(),
      city: formCity.trim(),
      address: formAddress.trim(),
      notes: formNotes.trim(),
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveClient(clientToSave);
    setIsEditModalOpen(false);
    if (viewingClient && viewingClient.id === clientToSave.id) {
      setViewingClient(clientToSave);
    }
  };

  // Associate orders with clients based on clientId or matching phone/name
  const getOrdersForClient = (client: Client): WorkOrder[] => {
    return orders.filter(o => {
      if (o.clientId && o.clientId === client.id) return true;
      // Match by phone number or exact name if clientId wasn't assigned
      if (o.phone && client.phone && o.phone.replace(/\D/g, '') === client.phone.replace(/\D/g, '')) return true;
      if (o.clientName.trim().toLowerCase() === client.name.trim().toLowerCase()) return true;
      return false;
    });
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      if (selectedCity !== 'SVI' && client.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = client.name.toLowerCase().includes(q);
        const matchPhone = client.phone.includes(q);
        const matchAddress = client.address.toLowerCase().includes(q);
        const matchCity = client.city.toLowerCase().includes(q);
        return matchName || matchPhone || matchAddress || matchCity;
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name, 'sr'));
  }, [clients, selectedCity, searchQuery]);

  // Unique cities
  const cities = useMemo(() => {
    const list = new Set<string>();
    clients.forEach(c => {
      if (c.city) list.add(c.city);
    });
    return Array.from(list);
  }, [clients]);

  return (
    <div className="space-y-4">
      
      {/* Top Banner & Search */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Baza Klijenata</h2>
              <p className="text-xs text-zinc-500">Evidencija kupaca i istorija njihovih montaža</p>
            </div>
          </div>

          <button
            onClick={handleAddNewClient}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novi Klijent</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretraga klijenata po imenu, telefonu, gradu, adresi..."
            className="w-full pl-10 pr-9 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-sm rounded-xl border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* City Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCity('SVI')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCity === 'SVI'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            Svi gradovi ({clients.length})
          </button>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCity === city
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Cards List */}
      <div className="space-y-3">
        {filteredClients.length > 0 ? (
          filteredClients.map(client => {
            const clientOrders = getOrdersForClient(client);
            const totalDoors = clientOrders.reduce((sum, o) => sum + o.doors.reduce((dSum, d) => dSum + (d.quantity || 1), 0), 0);
            const totalSpent = clientOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            const totalDebt = clientOrders.reduce((sum, o) => sum + (o.remainingDebt || 0), 0);
            const activeOrders = clientOrders.filter(o => o.phase !== 'montirano');

            const cleanPhone = client.phone.replace(/\s+/g, '');
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${client.address}, ${client.city}`)}`;

            return (
              <div
                key={client.id}
                onClick={() => setViewingClient(client)}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 active:scale-[0.99]"
              >
                {/* Top: Name, city & call button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 font-black text-sm flex items-center justify-center shrink-0 border border-amber-500/20">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {client.name}
                      </h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{client.address ? `${client.address}, ` : ''}{client.city}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Direct Actions - 44px touch targets */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${cleanPhone}`}
                      title="Pozovi klijenta"
                      className="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform"
                    >
                      <Phone className="w-4 h-4 fill-white" />
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Otvori na mapi"
                      className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Compass className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Orders Summary Badge row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-1">
                      <DoorClosed className="w-3.5 h-3.5 text-amber-500" />
                      <span>{clientOrders.length} {clientOrders.length === 1 ? 'nalog' : 'naloga'}</span>
                      {totalDoors > 0 && <span className="text-zinc-400 font-normal">({totalDoors} vrata)</span>}
                    </span>

                    {activeOrders.length > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-[11px] animate-pulse">
                        {activeOrders.length} u toku
                      </span>
                    )}
                  </div>

                  {/* Financial stats */}
                  <div className="text-right">
                    {totalDebt > 0 ? (
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                        Dug: {formatCurrency(totalDebt, 'EUR')}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Sve izmireno ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div 
                  className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onNewOrderForClient(client)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs active:scale-95 transition-all"
                  >
                    <FilePlus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Novi Nalog</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <button
                      onClick={(e) => handleEditClient(client, e)}
                      className="p-1.5 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Izmeni podatke klijenta"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => setViewingClient(client)}
                      className="flex items-center gap-0.5 font-medium hover:text-zinc-800 dark:hover:text-zinc-200 pl-1"
                    >
                      <span>Istorija</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center border border-zinc-200 dark:border-zinc-800 space-y-3">
            <Users className="w-10 h-10 text-zinc-300 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Nema pronađenih klijenata</h4>
            <p className="text-xs text-zinc-500">Pokušajte sa drugačijom pretragom ili dodajte novog kupca u bazu.</p>
            <button
              onClick={handleAddNewClient}
              className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Dodaj Klijenta</span>
            </button>
          </div>
        )}
      </div>

      {/* CLIENT PROFILE & WORK ORDERS HISTORY MODAL */}
      {viewingClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl max-h-[95vh] sm:max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom duration-200">
            
            {/* Mobile Sheet Handle */}
            <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 font-black text-sm flex items-center justify-center">
                  {viewingClient.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{viewingClient.name}</h3>
                  <p className="text-xs text-zinc-500">{viewingClient.city} • Profil kupca</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditClient(viewingClient)}
                  className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200"
                  title="Izmeni profil"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewingClient(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 hover:bg-zinc-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              
              {/* Contact card */}
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Telefon:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200 font-mono text-sm">{viewingClient.phone}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Grad:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200">{viewingClient.city}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 block text-[11px]">Adresa:</span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{viewingClient.address || 'Nije uneta tačna adresa'}</span>
                </div>

                {viewingClient.notes && (
                  <div className="pt-1 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Zabeleška:</span> {viewingClient.notes}
                  </div>
                )}

                {/* Direct quick call / maps */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${viewingClient.phone.replace(/\s+/g, '')}`}
                    className="py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 fill-white" />
                    <span>Pozovi</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${viewingClient.address}, ${viewingClient.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Compass className="w-3.5 h-3.5 text-blue-500" />
                    <span>Mape</span>
                  </a>
                </div>
              </div>

              {/* History of Work Orders */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <DoorClosed className="w-4 h-4 text-amber-500" />
                    <span>Istorija Radnih Naloga ({getOrdersForClient(viewingClient).length})</span>
                  </h4>

                  <button
                    onClick={() => {
                      onNewOrderForClient(viewingClient);
                      setViewingClient(null);
                    }}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Dodaj novi nalog</span>
                  </button>
                </div>

                {getOrdersForClient(viewingClient).length > 0 ? (
                  <div className="space-y-2.5">
                    {getOrdersForClient(viewingClient).map(order => {
                      const phase = getPhaseLabel(order.phase);
                      const totalDoors = order.doors.reduce((acc, d) => acc + (d.quantity || 1), 0);

                      return (
                        <div
                          key={order.id}
                          onClick={() => {
                            setViewingClient(null);
                            onOpenOrderDetails(order);
                          }}
                          className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300">
                              {order.orderNumber}
                            </span>
                            <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${phase.badgeBg} ${phase.badgeBorder}`}>
                              {phase.title}
                            </div>
                          </div>

                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            <strong>{totalDoors} kom vrata:</strong> {order.doors.map(d => `${d.roomName} (${d.width})`).join(', ')}
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200 dark:border-zinc-700">
                            <span className="text-zinc-500">
                              Ukupno: <strong>{formatCurrency(order.totalPrice, order.currency)}</strong>
                            </span>
                            <span className={`font-bold ${order.remainingDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {order.remainingDebt > 0 ? `Dug: ${formatCurrency(order.remainingDebt, order.currency)}` : 'Plaćeno ✓'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl text-center text-xs text-zinc-500">
                    Ovaj klijent još uvek nema kreiran radni nalog.
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer with Safe Area */}
            <div className="p-3.5 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] sm:pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky bottom-0 z-10 shrink-0 flex items-center gap-2">
              <button
                onClick={() => {
                  onNewOrderForClient(viewingClient);
                  setViewingClient(null);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <FilePlus className="w-4 h-4 stroke-[2.5]" />
                <span>Otvori novi radni nalog</span>
              </button>

              <button
                onClick={() => {
                  onDeleteClient(viewingClient.id);
                  setViewingClient(null);
                }}
                className="p-3 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95"
                title="Obriši klijenta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800">
            
            {/* Mobile Sheet Handle */}
            <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

            <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {editingClient ? 'Uredi podatke klijenta' : 'Novi Klijent'}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-4 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Ime i prezime klijenta *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="npr. Dragan Jovanović"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Broj telefona (Viber/Pozivi)
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="npr. 0641234567"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Grad
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Niš, Aleksinac..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Adresa
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Ulica i broj..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Napomene o klijentu
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="npr. pouzdan klijent, preporuka, radno vreme..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] sm:pb-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold active:scale-98 transition-all"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Sačuvaj</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
