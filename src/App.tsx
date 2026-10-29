import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  DoorClosed, 
  ArrowUpDown, 
  Users, 
  Sliders, 
  ClipboardList,
  Calculator
} from 'lucide-react';
import { WorkOrder, OrderPhase, Client, CatalogSettings, MainTab } from './types';
import { 
  getStoredOrders, 
  saveStoredOrders, 
  getStoredClients, 
  saveStoredClients, 
  getStoredCatalogs, 
  saveStoredCatalogs,
  DEFAULT_CATALOGS
} from './utils/orderUtils';
import { Header } from './components/Header';
import { PhaseTabs } from './components/PhaseTabs';
import { OrderCard } from './components/OrderCard';
import { OrderModal } from './components/OrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { DoorCalculatorModal } from './components/DoorCalculatorModal';
import { StatsDrawer } from './components/StatsDrawer';
import { CustomersView } from './components/CustomersView';
import { SettingsView } from './components/SettingsView';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogSettings>(DEFAULT_CATALOGS);
  
  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<MainTab>('nalozi');

  // Orders view filters
  const [selectedPhase, setSelectedPhase] = useState<OrderPhase | 'sve'>('zakazano_merenje');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('SVI');
  const [sortBy, setSortBy] = useState<'date' | 'debt' | 'name'>('date');

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [prefilledClientForOrder, setPrefilledClientForOrder] = useState<Client | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<WorkOrder | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const loadedOrders = getStoredOrders();
    const loadedClients = getStoredClients();
    const loadedCatalogs = getStoredCatalogs();
    setOrders(loadedOrders);
    setClients(loadedClients);
    setCatalogs(loadedCatalogs);
  }, []);

  // Save Orders
  const updateOrdersAndStore = (newOrders: WorkOrder[]) => {
    setOrders(newOrders);
    saveStoredOrders(newOrders);
  };

  // Save Clients
  const updateClientsAndStore = (newClients: Client[]) => {
    setClients(newClients);
    saveStoredClients(newClients);
  };

  // Save Catalogs
  const updateCatalogsAndStore = (newCatalogs: CatalogSettings) => {
    setCatalogs(newCatalogs);
    saveStoredCatalogs(newCatalogs);
  };

  // Available unique cities for filtering
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();
    catalogs.cities.forEach(c => citiesSet.add(c));
    orders.forEach(o => {
      if (o.city) citiesSet.add(o.city);
    });
    return Array.from(citiesSet);
  }, [catalogs.cities, orders]);

  // Phase transition handler
  const handleUpdatePhase = (orderId: string, newPhase: OrderPhase) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          phase: newPhase,
          updatedAt: new Date().toISOString(),
          paymentStatus: (newPhase === 'montirano' && o.remainingDebt === 0) ? ('paid' as const) : o.paymentStatus
        };
      }
      return o;
    });

    updateOrdersAndStore(updated);

    if (selectedDetailOrder && selectedDetailOrder.id === orderId) {
      setSelectedDetailOrder({ ...selectedDetailOrder, phase: newPhase });
    }
  };

  // Create or Update Order (with auto Client synchronization)
  const handleSaveOrder = (orderToSave: WorkOrder, clientData?: Client) => {
    // 1. Sync or add client in Baza Klijenata
    if (clientData) {
      const existingClientIndex = clients.findIndex(c => 
        (orderToSave.clientId && c.id === orderToSave.clientId) ||
        (c.phone && clientData.phone && c.phone.replace(/\D/g, '') === clientData.phone.replace(/\D/g, ''))
      );

      let updatedClients: Client[];
      if (existingClientIndex >= 0) {
        updatedClients = [...clients];
        updatedClients[existingClientIndex] = {
          ...updatedClients[existingClientIndex],
          name: clientData.name,
          phone: clientData.phone,
          city: clientData.city,
          address: clientData.address,
          updatedAt: new Date().toISOString()
        };
      } else {
        updatedClients = [clientData, ...clients];
      }
      updateClientsAndStore(updatedClients);
    }

    // 2. Update orders
    const exists = orders.some(o => o.id === orderToSave.id);
    let updated: WorkOrder[];
    if (exists) {
      updated = orders.map(o => o.id === orderToSave.id ? orderToSave : o);
    } else {
      updated = [orderToSave, ...orders];
    }
    updateOrdersAndStore(updated);

    setIsOrderModalOpen(false);
    setEditingOrder(null);
    setPrefilledClientForOrder(null);
    
    // Switch to orders tab & phase of the saved order
    setActiveTab('nalozi');
    if (selectedPhase !== 'sve' && selectedPhase !== orderToSave.phase) {
      setSelectedPhase(orderToSave.phase);
    }
  };

  // Delete Order
  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter(o => o.id !== orderId);
    updateOrdersAndStore(updated);
    setIsDetailModalOpen(false);
    setSelectedDetailOrder(null);
  };

  // Edit Trigger
  const handleEdit = (order: WorkOrder) => {
    setEditingOrder(order);
    setPrefilledClientForOrder(null);
    setIsDetailModalOpen(false);
    setIsOrderModalOpen(true);
  };

  // Open Details Trigger
  const handleOpenDetails = (order: WorkOrder) => {
    setSelectedDetailOrder(order);
    setIsDetailModalOpen(true);
  };

  // Trigger New Order for an existing client
  const handleNewOrderForClient = (client: Client) => {
    setEditingOrder(null);
    setPrefilledClientForOrder(client);
    setIsOrderModalOpen(true);
  };

  // Save client from CustomersView
  const handleSaveClientDirect = (clientToSave: Client) => {
    const exists = clients.some(c => c.id === clientToSave.id);
    let updated: Client[];
    if (exists) {
      updated = clients.map(c => c.id === clientToSave.id ? clientToSave : c);
    } else {
      updated = [clientToSave, ...clients];
    }
    updateClientsAndStore(updated);
  };

  // Delete client
  const handleDeleteClientDirect = (clientId: string) => {
    const updated = clients.filter(c => c.id !== clientId);
    updateClientsAndStore(updated);
  };

  // Restore full backup from Google Drive
  const handleRestoreBackup = (backup: { orders: WorkOrder[]; clients: Client[]; catalogs: CatalogSettings }) => {
    if (backup.orders && Array.isArray(backup.orders)) {
      updateOrdersAndStore(backup.orders);
    }
    if (backup.clients && Array.isArray(backup.clients)) {
      updateClientsAndStore(backup.clients);
    }
    if (backup.catalogs) {
      updateCatalogsAndStore(backup.catalogs);
    }
  };

  // Filter & Sort Logic for Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Phase Filter
      if (selectedPhase !== 'sve') {
        const orderPhase = order.phase === ('merenje' as any) ? 'zakazano_merenje' : order.phase === ('priprema' as any) ? 'uzete_mere' : order.phase;
        const filterPhase = selectedPhase === ('merenje' as any) ? 'zakazano_merenje' : selectedPhase === ('priprema' as any) ? 'uzete_mere' : selectedPhase;
        if (orderPhase !== filterPhase) {
          return false;
        }
      }

      // City Filter
      if (selectedCity !== 'SVI' && order.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesClient = order.clientName.toLowerCase().includes(query);
        const matchesPhone = order.phone.includes(query);
        const matchesCity = order.city.toLowerCase().includes(query);
        const matchesAddress = order.address.toLowerCase().includes(query);
        const matchesNumber = order.orderNumber.toLowerCase().includes(query);
        const matchesDoors = order.doors.some(d => 
          (d.roomName && d.roomName.toLowerCase().includes(query)) || 
          (d.model && d.model.toLowerCase().includes(query)) || 
          (d.decor && d.decor.toLowerCase().includes(query))
        );

        if (!matchesClient && !matchesPhone && !matchesCity && !matchesAddress && !matchesNumber && !matchesDoors) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'debt') {
        return (b.remainingDebt || 0) - (a.remainingDebt || 0);
      }
      if (sortBy === 'name') {
        return a.clientName.localeCompare(b.clientName, 'sr');
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, selectedPhase, selectedCity, searchQuery, sortBy]);

  const activeOrdersCount = orders.filter(o => o.phase !== 'montirano').length;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased pb-24 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Primary Header */}
      <Header
        orders={orders}
        clientsCount={clients.length}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onNewOrder={() => {
          setEditingOrder(null);
          setPrefilledClientForOrder(null);
          setIsOrderModalOpen(true);
        }}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* VIEW 1: RADNI NALOZI */}
      {activeTab === 'nalozi' && (
        <>
          {/* Sticky Top Phase Navigation & Search */}
          <PhaseTabs
            selectedPhase={selectedPhase}
            onSelectPhase={(phase) => setSelectedPhase(phase)}
            orders={orders}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            availableCities={availableCities}
          />

          {/* Main Content Area */}
          <main className="max-w-4xl w-full mx-auto px-3 sm:px-4 pt-3 pb-28 sm:pb-12 flex-1 overflow-x-hidden">
            
            {/* Status Bar / Sub-header */}
            <div className="flex items-center justify-between pb-2.5 text-xs text-zinc-500">
              <div>
                Prikazano: <strong className="text-zinc-800 dark:text-zinc-200">{filteredOrders.length}</strong> {filteredOrders.length === 1 ? 'radni nalog' : 'radnih naloga'}
              </div>

              {/* Quick Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="date" className="bg-white dark:bg-zinc-900">Najnovije</option>
                  <option value="debt" className="bg-white dark:bg-zinc-900">Po dugu za naplatu</option>
                  <option value="name" className="bg-white dark:bg-zinc-900">Po imenu klijenta</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-3.5">
                {filteredOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOpenDetails={handleOpenDetails}
                    onEdit={handleEdit}
                    onUpdatePhase={handleUpdatePhase}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center border border-zinc-200 dark:border-zinc-800 shadow-xs my-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <DoorClosed className="w-8 h-8" />
                </div>
                
                <div className="max-w-xs mx-auto space-y-1">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Nema radnih naloga u ovoj fazi
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {searchQuery 
                      ? `Nema rezultata za pretragu "${searchQuery}". Pokušajte drugi pojam.` 
                      : (selectedPhase === 'zakazano_merenje' || selectedPhase === ('merenje' as any)) 
                      ? 'Trenutno nema zakazanih merenja. Unesite novi radni nalog.' 
                      : (selectedPhase === 'uzete_mere' || selectedPhase === ('priprema' as any)) 
                      ? 'Nema naloga sa uzetim merama koji čekaju montažu.' 
                      : 'Nema montiranih vrata.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-200"
                    >
                      Očisti pretragu
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingOrder(null);
                      setPrefilledClientForOrder(null);
                      setIsOrderModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Dodaj novi nalog</span>
                  </button>
                </div>
              </div>
            )}

          </main>
        </>
      )}

      {/* VIEW 2: BAZA KLIJENATA */}
      {activeTab === 'klijenti' && (
        <main className="max-w-4xl w-full mx-auto px-3 sm:px-4 pt-3 pb-28 sm:pb-12 flex-1 overflow-x-hidden">
          <CustomersView
            clients={clients}
            orders={orders}
            onNewOrderForClient={handleNewOrderForClient}
            onOpenOrderDetails={handleOpenDetails}
            onSaveClient={handleSaveClientDirect}
            onDeleteClient={handleDeleteClientDirect}
          />
        </main>
      )}

      {/* VIEW 3: ŠIFARNICI & PODEŠAVANJA */}
      {activeTab === 'sifarnici' && (
        <main className="max-w-4xl w-full mx-auto px-3 sm:px-4 pt-3 pb-28 sm:pb-12 flex-1 overflow-x-hidden">
          <SettingsView
            catalogs={catalogs}
            onSaveCatalogs={updateCatalogsAndStore}
            orders={orders}
            clients={clients}
            onRestoreBackup={handleRestoreBackup}
          />
        </main>
      )}

      {/* Mobile Bottom Navigation Bar (Thumb-optimized, safe-area padded) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/90 dark:border-zinc-800 w-full max-w-full px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] flex items-center justify-around shadow-lg select-none">
        
        {/* Nalozi */}
        <button
          onClick={() => setActiveTab('nalozi')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative active:scale-95 ${
            activeTab === 'nalozi'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 font-medium'
          }`}
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Nalozi</span>
        </button>

        {/* Klijenti */}
        <button
          onClick={() => setActiveTab('klijenti')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'klijenti'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 font-medium'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 text-[10px] font-bold text-zinc-400">
              {clients.length}
            </span>
          </div>
          <span className="text-[10px] mt-0.5">Klijenti</span>
        </button>

        {/* Center Primary Action: Novi Nalog */}
        <button
          onClick={() => {
            setEditingOrder(null);
            setPrefilledClientForOrder(null);
            setIsOrderModalOpen(true);
          }}
          className="flex flex-col items-center justify-center -mt-5 mx-1 group active:scale-90 transition-transform"
          title="Dodaj novi radni nalog"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-white dark:border-zinc-900">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">Novi</span>
        </button>

        {/* Kalkulator */}
        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 hover:text-amber-500 active:scale-95"
          title="Kalkulator mera otvora i štoka"
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Kalkulator</span>
        </button>

        {/* Podešavanja & Drive */}
        <button
          onClick={() => setActiveTab('sifarnici')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'sifarnici'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 font-medium'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Podešavanja</span>
        </button>

      </nav>

      {/* Modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingOrder(null);
          setPrefilledClientForOrder(null);
        }}
        onSave={handleSaveOrder}
        initialOrder={editingOrder}
        prefilledClient={prefilledClientForOrder}
        catalogs={catalogs}
        clients={clients}
      />

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        order={selectedDetailOrder}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailOrder(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDeleteOrder}
        onUpdatePhase={handleUpdatePhase}
      />

      <DoorCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        orders={orders}
        onOrdersUpdated={(newOrders) => updateOrdersAndStore(newOrders)}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

    </div>
  );
}
