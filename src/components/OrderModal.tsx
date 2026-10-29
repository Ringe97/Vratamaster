import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Ruler, 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  MapPin, 
  Phone,
  DoorOpen,
  Check,
  Search,
  UserCheck,
  Info,
  Camera,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { WorkOrder, DoorItem, OrderPhase, OpeningDirection, PaymentStatus, CatalogSettings, Client } from '../types';
import { compressImageFile } from '../utils/orderUtils';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: WorkOrder, updatedClient?: Client) => void;
  initialOrder?: WorkOrder | null;
  prefilledClient?: Client | null;
  catalogs: CatalogSettings;
  clients: Client[];
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  prefilledClient,
  catalogs,
  clients
}) => {
  const [phase, setPhase] = useState<OrderPhase>('zakazano_merenje');
  const [orderNumber, setOrderNumber] = useState('');
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(catalogs.cities[0] || 'Niš');
  const [address, setAddress] = useState('');
  const [measurementDate, setMeasurementDate] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [installerNotes, setInstallerNotes] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'RSD'>('EUR');
  
  // Phase 1 specific state: estimated doors count & optional detailed dimensions toggle
  const [estimatedDoorsCount, setEstimatedDoorsCount] = useState<number>(3);
  const [showDetailedDoorsInPhase1, setShowDetailedDoorsInPhase1] = useState(false);

  // Client selection helper
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const defaultDoorModel = catalogs.doorModels[0] || 'CPL Standard sa lajsnama';
  const defaultDecor = catalogs.decors[0] || 'Beli Jasen (Mat)';
  const defaultLock = catalogs.lockTypes[0] || 'Običan ključ';
  const defaultThreshold = catalogs.thresholdTypes[0] || 'Bez praga';

  const createDoorItem = (index: number, roomName?: string): DoorItem => ({
    id: 'd-' + Date.now() + '-' + index + '-' + Math.random().toString(36).substr(2, 4),
    roomName: roomName || (index === 0 ? 'Dnevna soba' : index === 1 ? 'Spavaća soba' : index === 2 ? 'Kupatilo' : `Soba ${index + 1}`),
    model: defaultDoorModel,
    decor: defaultDecor,
    width: '80 cm',
    height: '205 cm',
    wallThickness: '14 cm',
    openingDirection: 'D',
    lockType: defaultLock,
    threshold: defaultThreshold,
    quantity: 1,
    unitPrice: 200,
    notes: ''
  });

  const [doors, setDoors] = useState<DoorItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [formError, setFormError] = useState('');

  // Slike sa terena (otvori, skice, stari štokovi)
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [activePreviewPhoto, setActivePreviewPhoto] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const base64 = await compressImageFile(file);
        newPhotos.push(base64);
      }
      setPhotos(prev => [...prev, ...newPhotos]);
    } catch (err) {
      console.error('Greška pri obradi slike:', err);
      alert('Došlo je do greške prilikom obrade slike.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (initialOrder) {
      const normalizedPhase: OrderPhase = 
        initialOrder.phase === 'merenje' ? 'zakazano_merenje' :
        initialOrder.phase === 'priprema' ? 'uzete_mere' :
        initialOrder.phase;
      setPhase(normalizedPhase);
      setOrderNumber(initialOrder.orderNumber);
      setClientId(initialOrder.clientId);
      setClientName(initialOrder.clientName);
      setPhone(initialOrder.phone);
      setCity(initialOrder.city);
      setAddress(initialOrder.address);
      setMeasurementDate(initialOrder.measurementDate || '');
      setInstallationDate(initialOrder.installationDate || '');
      
      const count = initialOrder.doors.length > 0 
        ? initialOrder.doors.reduce((acc, d) => acc + (d.quantity || 1), 0)
        : (initialOrder.estimatedDoorsCount || 3);
      setEstimatedDoorsCount(count);
      setDoors(initialOrder.doors || []);
      setShowDetailedDoorsInPhase1(initialOrder.doors.length > 0);
      setTotalPrice(initialOrder.totalPrice || 0);
      setDeposit(initialOrder.deposit || 0);
      setCurrency(initialOrder.currency || 'EUR');
      setInstallerNotes(initialOrder.installerNotes || '');
      setPhotos(initialOrder.photos || []);
    } else if (prefilledClient) {
      // Creating new order for an existing client
      const randomNum = Math.floor(100 + Math.random() * 900);
      setOrderNumber(`RN-2026-${randomNum}`);
      setPhase('zakazano_merenje');
      setClientId(prefilledClient.id);
      setClientName(prefilledClient.name);
      setPhone(prefilledClient.phone);
      setCity(prefilledClient.city);
      setAddress(prefilledClient.address);
      setMeasurementDate(new Date().toISOString().split('T')[0]);
      setInstallationDate('');
      setEstimatedDoorsCount(3);
      setDoors([]);
      setShowDetailedDoorsInPhase1(false);
      setTotalPrice(0);
      setDeposit(0);
      setCurrency('EUR');
      setInstallerNotes('');
      setPhotos([]);
    } else {
      // Fresh new order
      const randomNum = Math.floor(100 + Math.random() * 900);
      setOrderNumber(`RN-2026-${randomNum}`);
      setPhase('zakazano_merenje');
      setClientId(undefined);
      setClientName('');
      setPhone('');
      setCity(catalogs.cities[0] || 'Niš');
      setAddress('');
      setMeasurementDate(new Date().toISOString().split('T')[0]);
      setInstallationDate('');
      setEstimatedDoorsCount(3);
      setDoors([]);
      setShowDetailedDoorsInPhase1(false);
      setTotalPrice(0);
      setDeposit(0);
      setCurrency('EUR');
      setInstallerNotes('');
      setPhotos([]);
    }
  }, [initialOrder, prefilledClient, isOpen]);

  if (!isOpen) return null;

  // Pick existing client
  const handleSelectExistingClient = (c: Client) => {
    setClientId(c.id);
    setClientName(c.name);
    setPhone(c.phone);
    setCity(c.city);
    setAddress(c.address);
    setShowClientPicker(false);
  };

  // Phase change with auto-population of doors when switching to Phase 2/3
  const handlePhaseChange = (newPhase: OrderPhase) => {
    setPhase(newPhase);
    if ((newPhase === 'uzete_mere' || newPhase === 'montirano') && doors.length === 0) {
      const count = Math.max(1, estimatedDoorsCount || 1);
      const generatedDoors: DoorItem[] = [];
      for (let i = 0; i < count; i++) {
        generatedDoors.push(createDoorItem(i));
      }
      setDoors(generatedDoors);
      if (totalPrice === 0) {
        setTotalPrice(count * 200);
      }
    }
  };

  // Izračunavanje preostalog duga i statusa plaćanja
  const remainingDebt = Math.max(0, totalPrice - deposit);
  let paymentStatus: PaymentStatus = 'unpaid';
  if (totalPrice > 0 && deposit >= totalPrice) {
    paymentStatus = 'paid';
  } else if (deposit > 0) {
    paymentStatus = 'partial';
  }

  // Automatsko računanje cene po stavkama vrata
  const calculateTotalFromDoors = () => {
    const sum = doors.reduce((acc, d) => acc + ((d.unitPrice || 0) * (d.quantity || 1)), 0);
    setTotalPrice(sum);
  };

  const addDoor = () => {
    setDoors(prev => [
      ...prev,
      {
        id: 'd-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        roomName: 'Soba ' + (prev.length + 1),
        model: prev[prev.length - 1]?.model || defaultDoorModel,
        decor: prev[prev.length - 1]?.decor || defaultDecor,
        width: '80 cm',
        height: '205 cm',
        wallThickness: '14 cm',
        openingDirection: 'L',
        lockType: prev[prev.length - 1]?.lockType || defaultLock,
        threshold: prev[prev.length - 1]?.threshold || defaultThreshold,
        quantity: 1,
        unitPrice: 200,
        notes: ''
      }
    ]);
  };

  const removeDoor = (id: string) => {
    setDoors(prev => prev.filter(d => d.id !== id));
  };

  const updateDoor = (id: string, updates: Partial<DoorItem>) => {
    setDoors(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const isPhase1 = phase === 'zakazano_merenje' || phase === ('merenje' as any);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!clientName.trim()) {
      setFormError('Molimo unesite ime klijenta pre čuvanja.');
      return;
    }

    // Determine final doors array
    let finalDoors = doors;
    if (isPhase1 && !showDetailedDoorsInPhase1 && doors.length === 0) {
      finalDoors = [];
    }

    const orderToSave: WorkOrder = {
      id: initialOrder ? initialOrder.id : 'wo-' + Date.now(),
      orderNumber,
      createdAt: initialOrder ? initialOrder.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phase,
      clientId: clientId || ('cli-' + Date.now()),
      clientName: clientName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      measurementDate,
      installationDate,
      estimatedDoorsCount: Number(estimatedDoorsCount) || (finalDoors.length > 0 ? finalDoors.reduce((a, b) => a + (b.quantity || 1), 0) : 1),
      doors: finalDoors,
      totalPrice: Number(totalPrice) || 0,
      deposit: Number(deposit) || 0,
      remainingDebt,
      paymentStatus,
      currency,
      installerNotes: installerNotes.trim(),
      photos
    };

    // Client object to sync
    const clientData: Client = {
      id: clientId || ('cli-' + Date.now()),
      name: clientName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      createdAt: new Date().toISOString()
    };

    onSave(orderToSave, clientData);
  };

  // Filter clients for picker
  const filteredClientsForPicker = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.phone.includes(clientSearch) ||
    c.city.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[95vh] sm:max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800">
        
        {/* Mobile Sheet Handle */}
        <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

        {/* Sticky Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {initialOrder ? 'Uredi Radni Nalog' : 'Novi Radni Nalog'}
              </h2>
              <span className="text-xs font-mono font-semibold text-zinc-500">
                {orderNumber}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSave} className="overflow-y-auto p-4 space-y-6 flex-1">
          
          {/* SEKCION 1: STATUS RADNOG NALOGA (3 FAZE) */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Status / Faza Radnog Naloga:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              
              <button
                type="button"
                onClick={() => handlePhaseChange('zakazano_merenje')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  phase === 'zakazano_merenje' || phase === ('merenje' as any)
                    ? 'bg-sky-500 text-white border-sky-600 shadow-sm ring-2 ring-sky-400/30'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                }`}
              >
                1. Zakazano merenje
              </button>

              <button
                type="button"
                onClick={() => handlePhaseChange('uzete_mere')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  phase === 'uzete_mere' || phase === ('priprema' as any)
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-2 ring-amber-400/30'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                }`}
              >
                2. Uzete mere
              </button>

              <button
                type="button"
                onClick={() => handlePhaseChange('montirano')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  phase === 'montirano'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400/30'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                }`}
              >
                3. Montirano
              </button>

            </div>

            {/* Explanatory subtitle for current phase */}
            <div className="text-[11px] text-zinc-500 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 leading-relaxed">
              {isPhase1 && (
                <span>📍 <strong>1. Zakazano merenje:</strong> Kada te klijent pozove i zapišeš ga. Nalog je u ovoj fazi dok ne odeš na teren (dimenzije nisu obavezne).</span>
              )}
              {(phase === 'uzete_mere' || phase === ('priprema' as any)) && (
                <span>📐 <strong>2. Uzete mere:</strong> Kada odeš na adresu, uneseš tačne dimenzije, model vrata, avans i čeka se montaža.</span>
              )}
              {phase === 'montirano' && (
                <span>✅ <strong>3. Montirano:</strong> Konačna faza kada su vrata ugrađena i posao uspešno završen.</span>
              )}
            </div>
          </div>

          {/* SEKCION 2: OSNOVNI PODACI KLIJENTA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Podaci o Kupcu i Lokaciji</span>
              </div>

              {clients.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClientPicker(!showClientPicker)}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{showClientPicker ? 'Zatvori izbor' : 'Izaberi postojećeg klijenta'}</span>
                </button>
              )}
            </div>

            {/* Existing client picker dropdown / search */}
            {showClientPicker && (
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                  Izaberite klijenta iz Baze:
                </span>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Pretraži klijente..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pt-1">
                  {filteredClientsForPicker.slice(0, 6).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectExistingClient(c)}
                      className="w-full text-left p-2 rounded-lg bg-white dark:bg-zinc-900 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs flex items-center justify-between transition-colors border border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="min-w-0">
                        <strong className="text-zinc-900 dark:text-zinc-100 block truncate">{c.name}</strong>
                        <span className="text-[11px] text-zinc-500 truncate">{c.phone} • {c.city}</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">Izaberi</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ime i prezime */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ime i prezime klijenta *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="npr. Dragan Jovanović"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Broj telefona */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Broj telefona (za pozive i Viber) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="npr. 0641234567"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Grad */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Grad / Opština
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {catalogs.cities.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      city === c
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Unesite ili izaberite grad..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Tačna adresa */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tačna adresa (Ulica, broj, stan, sprat)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="npr. Bulevar Nemanjića 42, stan 18, 4. sprat"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Datumi merenja i montaže */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Datum zakazanog merenja
                </label>
                <input
                  type="date"
                  value={measurementDate}
                  onChange={(e) => setMeasurementDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Termin montaže
                </label>
                <input
                  type="date"
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* SEKCION 3: TEHNIČKI DETALJI - VRATA */}
          <div className="space-y-3 pt-2">
            
            {/* When Phase 1: Dimenzije NISU obavezne */}
            {isPhase1 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <Ruler className="w-3.5 h-3.5 text-sky-500" />
                    <span>Sobna Vrata (Faza: Zakazano merenje)</span>
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800">
                    Mere na terenu
                  </span>
                </div>

                {/* Info Card: Dimenzije nisu obavezne */}
                <div className="bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-sky-950 dark:text-sky-200">
                        Dimenzije nisu obavezne u ovoj fazi
                      </h4>
                      <p className="text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed mt-0.5">
                        Kada te klijent tek pozove i zapišeš ga, nalog ostaje u fazi <strong>"Zakazano merenje"</strong>. 
                        Kada odeš na teren kod klijenta, skineš tačne mere (širinu, visinu, debljinu zida i smer otvaranja) i nalog prebaciš u drugu fazu <strong>"Uzete mere"</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Okvirna procena broja vrata */}
                  <div className="pt-2 border-t border-sky-200/70 dark:border-sky-900/60 space-y-2">
                    <label className="block text-xs font-bold text-sky-950 dark:text-sky-200">
                      Okvirna procena broja vrata kod klijenta:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 8].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setEstimatedDoorsCount(num)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            estimatedDoorsCount === num
                              ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/40'
                              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-sky-200 dark:border-zinc-700 hover:bg-sky-100'
                          }`}
                        >
                          {num} kom
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-sky-900 dark:text-sky-300 font-medium">Ili upišite tačan broj:</span>
                      <input
                        type="number"
                        min="1"
                        value={estimatedDoorsCount}
                        onChange={(e) => setEstimatedDoorsCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-1.5 text-xs text-center font-bold rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      />
                      <span className="text-xs text-zinc-500">vrata</span>
                    </div>
                  </div>

                  {/* Toggle: unesi dimenzije odmah ako klijent već zna */}
                  <div className="pt-2 border-t border-sky-200/70 dark:border-sky-900/60">
                    <button
                      type="button"
                      onClick={() => {
                        if (!showDetailedDoorsInPhase1 && doors.length === 0) {
                          const count = Math.max(1, estimatedDoorsCount || 1);
                          const generatedDoors: DoorItem[] = [];
                          for (let i = 0; i < count; i++) {
                            generatedDoors.push(createDoorItem(i));
                          }
                          setDoors(generatedDoors);
                        }
                        setShowDetailedDoorsInPhase1(!showDetailedDoorsInPhase1);
                      }}
                      className="text-xs font-bold text-sky-700 dark:text-sky-300 hover:underline flex items-center gap-1.5"
                    >
                      <span>{showDetailedDoorsInPhase1 ? '▼ Sakrij detaljan unos dimenzija' : '▶ Unesi dimenzije odmah (opciono, ukoliko klijent već zna mere)'}</span>
                    </button>
                  </div>
                </div>

                {/* If user opted to input door items in Phase 1, show them below */}
                {showDetailedDoorsInPhase1 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                        Pozicije vrata ({doors.length} kom):
                      </span>
                      <button
                        type="button"
                        onClick={addDoor}
                        className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Dodaj vrata</span>
                      </button>
                    </div>

                    {doors.map((door, index) => renderDoorCard(door, index))}
                  </div>
                )}
              </div>
            ) : (
              /* When in Phase 2 ("Uzete mere") or Phase 3 ("Montirano"): full door specifications */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <Ruler className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sobna Vrata ({doors.length} pozicija)</span>
                  </div>
                  <button
                    type="button"
                    onClick={addDoor}
                    className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Dodaj još jedna vrata</span>
                  </button>
                </div>

                {doors.length === 0 ? (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl text-center border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2">
                    <p className="text-xs text-zinc-500">Nema unetih vrata. Kliknite ispod da generišete stavke:</p>
                    <button
                      type="button"
                      onClick={() => {
                        const count = Math.max(1, estimatedDoorsCount || 1);
                        const generated: DoorItem[] = [];
                        for (let i = 0; i < count; i++) {
                          generated.push(createDoorItem(i));
                        }
                        setDoors(generated);
                      }}
                      className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg"
                    >
                      + Generiši {estimatedDoorsCount} pozicije za merenje
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doors.map((door, index) => renderDoorCard(door, index))}
                  </div>
                )}

                {doors.length > 0 && (
                  <button
                    type="button"
                    onClick={calculateTotalFromDoors}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium block pt-1"
                  >
                    🔄 Preračunaj ukupnu cenu sabiranjem svih vrata
                  </button>
                )}
              </div>
            )}

          </div>

          {/* SEKCION 4: FINANSIJE I STATUS PLAĆANJA */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                <span>Finansije i Plaćanje</span>
              </div>
              <div className="flex items-center gap-1">
                {(['EUR', 'RSD'] as const).map(curr => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      currency === curr 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Ukupna cena ({currency})
                </label>
                <input
                  type="number"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Uplaćeni avans ({currency})
                </label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Dug & Status Preview */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium">Preostali dug za naplatu:</span>
              <span className={`text-base font-black ${
                remainingDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {remainingDebt} {currency} {remainingDebt === 0 && totalPrice > 0 && '✓'}
              </span>
            </div>

            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              <span>Status uplate:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                paymentStatus === 'paid' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : paymentStatus === 'partial' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {paymentStatus === 'paid' ? 'Isplaćeno u celosti' : paymentStatus === 'partial' ? 'Delimično (Avans)' : 'Nije uplaćeno'}
              </span>
            </div>
          </div>

          {/* SEKCION: FOTOGRAFIJE SA TERENA I OTVORA */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>Fotografije sa Terena & Otvori</span>
              </div>
              {photos.length > 0 && (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {photos.length} {photos.length === 1 ? 'slika' : 'slike'}
                </span>
              )}
            </div>

            {/* Skriveni inputi za kameru i galeriju */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                handlePhotoFiles(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                handlePhotoFiles(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />

            {/* Dugmad za dodavanje fotografija */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="py-2.5 px-3 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
              >
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Slikaj kamerom</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="py-2.5 px-3 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
              >
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span>Izaberi iz galerije</span>
              </button>
            </div>

            {isUploadingPhoto && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                <span>Obrada i optimizacija fotografija...</span>
              </div>
            )}

            {/* Prikaz sličica */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                {photos.map((photo, pIdx) => (
                  <div 
                    key={pIdx} 
                    className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-900 shadow-xs cursor-pointer"
                    onClick={() => setActivePreviewPhoto(photo)}
                  >
                    <img 
                      src={photo} 
                      alt={`Slika terena ${pIdx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    
                    {/* View icon overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Eye className="w-5 h-5" />
                    </div>

                    {/* Dugme za brisanje slike */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(pIdx);
                      }}
                      title="Ukloni sliku"
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/75 hover:bg-rose-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 text-center py-1">
                Dodajte fotografije otvora zida, starih vrata ili skice sa terena.
              </p>
            )}
          </div>

          {/* SEKCION 5: NAPOMENE ZA UGRADNJU */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Napomene za Montažu i Radionicu</span>
            </div>

            {/* Quick preset chips from Catalogs */}
            <div className="flex flex-wrap gap-1.5">
              {catalogs.quickNotes.map((note, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInstallerNotes(prev => prev ? `${prev}, ${note}` : note)}
                  className="px-2 py-1 text-[11px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-md transition-colors"
                >
                  + {note}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={installerNotes}
              onChange={(e) => setInstallerNotes(e.target.value)}
              placeholder="Unesite specifičnosti terena, zahteve klijenta, stanje zidova..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

        </form>

        {/* Sticky Mobile Footer Action Bar with Safe Area */}
        <div className="p-3.5 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] sm:pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky bottom-0 z-10 shrink-0 space-y-2">
          {formError && (
            <p className="text-xs text-rose-500 font-bold text-center">{formError}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 active:scale-98 transition-all"
            >
              Otkaži
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-[2] py-3 px-4 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Sačuvaj Radni Nalog</span>
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox / Fullscreen Image Preview */}
      {activePreviewPhoto && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setActivePreviewPhoto(null)}
        >
          <button
            onClick={() => setActivePreviewPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 z-10"
            title="Zatvori pregled"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activePreviewPhoto}
            alt="Prikaz fotografije"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );

  // Helper to render an individual door editor card
  function renderDoorCard(door: DoorItem, index: number) {
    return (
      <div 
        key={door.id} 
        className="bg-zinc-50 dark:bg-zinc-800/70 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 space-y-3 relative"
      >
        {/* Card top */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/80 pb-2">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">
              {index + 1}
            </span>
            Pozicija: {door.roomName}
          </span>

          {doors.length > 1 && (
            <button
              type="button"
              onClick={() => removeDoor(door.id)}
              className="text-rose-500 hover:text-rose-700 p-1 rounded-md"
              title="Ukloni ova vrata"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Room name & quantity */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Prostorija
            </label>
            <input
              type="text"
              value={door.roomName}
              onChange={(e) => updateDoor(door.id, { roomName: e.target.value })}
              placeholder="npr. Kupatilo, Dnevna..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Količina (kom)
            </label>
            <input
              type="number"
              min="1"
              value={door.quantity}
              onChange={(e) => updateDoor(door.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-1.5 text-xs text-center font-bold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Model & Dekor (Populated from Catalogs) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Model vrata
            </label>
            <select
              value={door.model}
              onChange={(e) => updateDoor(door.id, { model: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              {catalogs.doorModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Dekor / Boja
            </label>
            <select
              value={door.decor}
              onChange={(e) => updateDoor(door.id, { decor: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              {catalogs.decors.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dimenzije (Širina, Visina, Debljina zida) */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Širina
              </label>
              <input
                type="text"
                value={door.width || ''}
                onChange={(e) => updateDoor(door.id, { width: e.target.value })}
                placeholder="80 cm"
                className="w-full px-2.5 py-1.5 text-xs text-center font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Visina
              </label>
              <input
                type="text"
                value={door.height || ''}
                onChange={(e) => updateDoor(door.id, { height: e.target.value })}
                placeholder="205 cm"
                className="w-full px-2.5 py-1.5 text-xs text-center font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Debljina zida
              </label>
              <input
                type="text"
                value={door.wallThickness || ''}
                onChange={(e) => updateDoor(door.id, { wallThickness: e.target.value })}
                placeholder="14 cm"
                className="w-full px-2.5 py-1.5 text-xs text-center font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Quick-tap dimension pills for field measuring */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 pb-1">
            <span className="text-[10px] text-zinc-400 shrink-0">Brzi odabir širine:</span>
            {['65 cm', '70 cm', '75 cm', '80 cm', '85 cm', '90 cm'].map(w => (
              <button
                key={w}
                type="button"
                onClick={() => updateDoor(door.id, { width: w })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 transition-colors ${
                  door.width === w
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Smer otvaranja (L / D) */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
            Smer otvaranja krila:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateDoor(door.id, { openingDirection: 'L' })}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                door.openingDirection === 'L'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-400/40'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              <span>⬅️ LEVO (L)</span>
            </button>

            <button
              type="button"
              onClick={() => updateDoor(door.id, { openingDirection: 'D' })}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                door.openingDirection === 'D'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-400/40'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              <span>DESNO (D) ➡️</span>
            </button>
          </div>
        </div>

        {/* Brava & Prag (From Catalogs) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Tip brave
            </label>
            <select
              value={door.lockType}
              onChange={(e) => updateDoor(door.id, { lockType: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              {catalogs.lockTypes.map((lt) => (
                <option key={lt} value={lt}>{lt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Prag
            </label>
            <select
              value={door.threshold}
              onChange={(e) => updateDoor(door.id, { threshold: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              {catalogs.thresholdTypes.map((tt) => (
                <option key={tt} value={tt}>{tt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cena po vratima & posebna napomena */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Cena ({currency})
            </label>
            <input
              type="number"
              value={door.unitPrice || 0}
              onChange={(e) => updateDoor(door.id, { unitPrice: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Posebna napomena za ova vrata
            </label>
            <input
              type="text"
              value={door.notes || ''}
              onChange={(e) => updateDoor(door.id, { notes: e.target.value })}
              placeholder="npr. širi pervajz, podrezati..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

      </div>
    );
  }
};
