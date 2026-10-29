export type OrderPhase = 'zakazano_merenje' | 'uzete_mere' | 'montirano' | 'merenje' | 'priprema';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export type LockType = string;

export type OpeningDirection = 'L' | 'D';

export interface DoorItem {
  id: string;
  roomName: string; // npr. Dnevna, Kupatilo, Spavaća
  model?: string; // npr. CPL Standard, Medijapan Gravirani, Furnir
  decor?: string; // npr. Beli Jasen, Hrast Sonoma, Antracit
  width?: string; // npr. 80 cm ili 780 mm (opciono u fazi Zakazano merenje)
  height?: string; // npr. 205 cm (opciono u fazi Zakazano merenje)
  wallThickness?: string; // npr. 14 cm (opciono u fazi Zakazano merenje)
  openingDirection?: OpeningDirection; // 'L' (Levo) ili 'D' (Desno)
  lockType?: LockType; // Obična brava, WC bravica, Cilindar, Magnetna
  threshold?: string; // 'Bez praga', 'Padajući prag', 'Alu lajsna', 'Drveni'
  quantity: number;
  unitPrice?: number;
  notes?: string; // npr. Podseći 1cm, kriv zid
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CatalogSettings {
  doorModels: string[];
  decors: string[];
  lockTypes: string[];
  thresholdTypes: string[];
  cities: string[];
  quickNotes: string[];
}

export interface WorkOrder {
  id: string;
  orderNumber: string; // npr. RN-104
  createdAt: string;
  updatedAt: string;
  phase: OrderPhase;
  
  // Povezani klijent
  clientId?: string;

  // Osnovni podaci
  clientName: string;
  phone: string;
  city: string; // Niš, Aleksinac, Sokobanja, Prokuplje...
  address: string;
  
  // Datumi
  measurementDate?: string;
  installationDate?: string;
  
  // Okvirna procena broja vrata pre merenja na terenu
  estimatedDoorsCount?: number;

  // Tehnički detalji - Vrata (unose se na terenu)
  doors: DoorItem[];
  
  // Finansije
  totalPrice: number;
  deposit: number;
  remainingDebt: number;
  paymentStatus: PaymentStatus;
  currency: 'RSD' | 'EUR';
  
  // Napomene
  installerNotes: string;
  
  // Opcione slike ili fotografije otvora
  photos?: string[];
}

export type CityFilter = 'SVI' | 'Niš' | 'Aleksinac' | 'Sokobanja' | 'Ostalo';
export type MainTab = 'nalozi' | 'klijenti' | 'sifarnici';

