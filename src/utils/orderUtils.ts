import { WorkOrder, OrderPhase, Client, CatalogSettings } from '../types';
import { INITIAL_ORDERS } from '../data/mockOrders';

const STORAGE_KEY = 'vratamaster_orders_v1';
const CLIENTS_STORAGE_KEY = 'vratamaster_clients_v1';
const CATALOGS_STORAGE_KEY = 'vratamaster_catalogs_v1';

export const DEFAULT_CATALOGS: CatalogSettings = {
  doorModels: [
    'CPL Standard sa lajsnama',
    'Medijapan gravirani Linea',
    'Furnirani Hrast Natur',
    'Kraft Master 4 polja',
    'Skriveni štok (Invisio)',
    'Staklena sobna vrata',
    'Zvučno izolovana CPL 32dB',
    'Klizna sobna vrata u zid'
  ],
  decors: [
    'Beli Jasen (Mat)',
    'Prirodni Hrast',
    'Hrast Sonoma',
    'Antracit Siva',
    'Wenge Tamni',
    'Kašmir Siva',
    'Bela Ral 9010',
    'Orah Klasik',
    'Svetli Brest'
  ],
  lockTypes: [
    'Običan ključ',
    'WC leptir bravica',
    'Cilindar (Yale)',
    'Magnetna brava AGB',
    'Pametna digitalna brava'
  ],
  thresholdTypes: [
    'Bez praga',
    'Padajući prag (automatski)',
    'Drveni prag (hrast)',
    'Alu prelazna lajsna'
  ],
  cities: [
    'Niš',
    'Aleksinac',
    'Sokobanja',
    'Prokuplje',
    'Leskovac',
    'Svrljig',
    'Knjaževac',
    'Bela Palanka'
  ],
  quickNotes: [
    'Demontaža starih drvenih vrata neophodna',
    'Kriv desni zid (+1.5cm)',
    'Kupac sam obezbeđuje kvake',
    'Paziti na keramiku u kupatilu',
    'Podseći krilo 1cm zbog debelog tepiha',
    'Potrebno proširenje štoka (zid > 15cm)',
    'Potreban uži pervajz do ugla zida'
  ]
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Dragan Jovanović',
    phone: '+381641234567',
    city: 'Niš',
    address: 'Bulevar Nemanjića 42, stan 18',
    notes: 'Kvalitetan kupac, renovira ceo stan.',
    createdAt: '2026-10-20T09:30:00Z'
  },
  {
    id: 'cli-2',
    name: 'Marko Stojanović',
    phone: '+381639876543',
    city: 'Aleksinac',
    address: 'Knjaza Miloša 78',
    notes: 'Porodična kuća, planira i zamenu ulaznih vrata sledeće godine.',
    createdAt: '2026-10-18T14:15:00Z'
  },
  {
    id: 'cli-3',
    name: 'Goran Nikolić (Vila Ozren)',
    phone: '+381655554433',
    city: 'Sokobanja',
    address: 'Vojvode Mišića 14, Apartmani',
    notes: 'Vlasnik apartmana u Sokobanji, redovno oprema objekte.',
    createdAt: '2026-10-15T11:00:00Z'
  },
  {
    id: 'cli-4',
    name: 'Jelena Petrović',
    phone: '+381601122334',
    city: 'Niš',
    address: 'Pantelej, Somborska 34a',
    notes: 'Preporuka od komšije iz zgrade.',
    createdAt: '2026-10-05T10:00:00Z'
  },
  {
    id: 'cli-5',
    name: 'Nenad Kostić',
    phone: '+381628889900',
    city: 'Niš',
    address: 'Palilula, Mokranjčeva 15',
    notes: 'Zahtevao skrivene šarke i magnetne brave.',
    createdAt: '2026-10-02T13:00:00Z'
  }
];

export function getStoredCatalogs(): CatalogSettings {
  try {
    const raw = localStorage.getItem(CATALOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify(DEFAULT_CATALOGS));
      return DEFAULT_CATALOGS;
    }
    const parsed = JSON.parse(raw);
    return {
      doorModels: parsed.doorModels || DEFAULT_CATALOGS.doorModels,
      decors: parsed.decors || DEFAULT_CATALOGS.decors,
      lockTypes: parsed.lockTypes || DEFAULT_CATALOGS.lockTypes,
      thresholdTypes: parsed.thresholdTypes || DEFAULT_CATALOGS.thresholdTypes,
      cities: parsed.cities || DEFAULT_CATALOGS.cities,
      quickNotes: parsed.quickNotes || DEFAULT_CATALOGS.quickNotes,
    };
  } catch (e) {
    console.error('Error loading catalogs from localStorage:', e);
    return DEFAULT_CATALOGS;
  }
}

export function saveStoredCatalogs(catalogs: CatalogSettings): void {
  try {
    localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify(catalogs));
  } catch (e) {
    console.error('Error saving catalogs:', e);
  }
}

export function getStoredClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CLIENTS;
  } catch (e) {
    console.error('Error loading clients from localStorage:', e);
    return INITIAL_CLIENTS;
  }
}

export function saveStoredClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Error saving clients:', e);
  }
}

export function getStoredOrders(): WorkOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Connect initial mock orders to initial clients
      const linkedInitial = INITIAL_ORDERS.map((o, idx) => ({
        ...o,
        clientId: INITIAL_CLIENTS[idx]?.id || 'cli-' + (idx + 1)
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(linkedInitial));
      return linkedInitial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Normalize legacy phase names
      return parsed.map((o: WorkOrder) => {
        let phase = o.phase;
        if (phase === ('merenje' as any)) phase = 'zakazano_merenje';
        if (phase === ('priprema' as any)) phase = 'uzete_mere';
        return { ...o, phase };
      });
    }
    return INITIAL_ORDERS;
  } catch (e) {
    console.error('Error loading orders from localStorage:', e);
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: WorkOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders to localStorage:', e);
  }
}

export function resetStoredOrders(): { orders: WorkOrder[]; clients: Client[]; catalogs: CatalogSettings } {
  const linkedInitial = INITIAL_ORDERS.map((o, idx) => ({
    ...o,
    clientId: INITIAL_CLIENTS[idx]?.id || 'cli-' + (idx + 1)
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(linkedInitial));
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
  localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify(DEFAULT_CATALOGS));
  return { orders: linkedInitial, clients: INITIAL_CLIENTS, catalogs: DEFAULT_CATALOGS };
}

export function formatCurrency(amount: number, currency: 'RSD' | 'EUR' = 'EUR'): string {
  if (currency === 'EUR') {
    return `${amount.toLocaleString('sr-RS')} €`;
  }
  return `${amount.toLocaleString('sr-RS')} din`;
}

export function getPhaseLabel(phase: OrderPhase): { title: string; shortTitle: string; step: string; color: string; badgeBg: string; badgeBorder: string; badgeText: string; description: string } {
  switch (phase) {
    case 'zakazano_merenje':
    case 'merenje':
      return {
        title: 'Zakazano merenje',
        shortTitle: 'Zakazano merenje',
        step: 'Faza 1',
        description: 'Kada te klijent pozove i zapišeš ga, nalog je u ovoj fazi dok ne odeš na teren.',
        color: 'sky',
        badgeBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
        badgeBorder: 'border-sky-200 dark:border-sky-800',
        badgeText: 'text-sky-700 dark:text-sky-400'
      };
    case 'uzete_mere':
    case 'priprema':
      return {
        title: 'Uzete mere',
        shortTitle: 'Uzete mere',
        step: 'Faza 2',
        description: 'Kada odeš na adresu, uneseš tačne dimenzije, model vrata, avans i čeka se montaža.',
        color: 'amber',
        badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        badgeBorder: 'border-amber-200 dark:border-amber-800',
        badgeText: 'text-amber-700 dark:text-amber-400'
      };
    case 'montirano':
    default:
      return {
        title: 'Montirano',
        shortTitle: 'Montirano',
        step: 'Faza 3',
        description: 'Konačna faza kada su vrata ugrađena i posao uspešno završen.',
        color: 'emerald',
        badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800',
        badgeText: 'text-emerald-700 dark:text-emerald-400'
      };
  }
}

export function generateViberOrderSummary(order: WorkOrder): string {
  const totalDoors = order.doors.reduce((acc, d) => acc + (d.quantity || 1), 0);
  
  let text = `📋 RADNI NALOG: ${order.orderNumber}\n`;
  text += `📌 Status: ${getPhaseLabel(order.phase).title}\n`;
  text += `👤 Klijent: ${order.clientName}\n`;
  text += `📞 Telefon: ${order.phone}\n`;
  text += `📍 Adresa: ${order.address}, ${order.city}\n`;
  if (order.measurementDate) text += `📏 Zakazano merenje: ${order.measurementDate}\n`;
  if (order.installationDate) text += `🔨 Montaža: ${order.installationDate}\n`;
  
  if (order.doors.length === 0) {
    text += `\n🚪 VRATA: Okvirno ${order.estimatedDoorsCount || 0} kom (tačne dimenzije i modeli se uzimaju na terenu)\n`;
  } else {
    text += `\n🚪 VRATA (Ukupno: ${totalDoors} kom):\n`;
    order.doors.forEach((door, idx) => {
      const dir = door.openingDirection ? (door.openingDirection === 'L' ? '⬅️ LEVO [L]' : '➡️ DESNO [D]') : 'Nije definisano';
      const dim = (door.width && door.height) ? `${door.width} x ${door.height} | Zid: ${door.wallThickness || 'b/o'}` : 'Mere se uzimaju na terenu';
      text += `${idx + 1}. ${door.roomName || 'Vrata'} (${door.quantity}x):\n`;
      text += `   • Dimenzije: ${dim}\n`;
      if (door.openingDirection) text += `   • Smer otvaranja: ${dir}\n`;
      if (door.model) text += `   • Model: ${door.model} (${door.decor || ''})\n`;
      if (door.lockType) text += `   • Brava: ${door.lockType} | Prag: ${door.threshold || 'b/o'}\n`;
      if (door.notes) text += `   • Napomena: ${door.notes}\n`;
    });
  }

  text += `\n💰 FINANSIJE (${order.currency}):\n`;
  text += `• Ukupno: ${formatCurrency(order.totalPrice, order.currency)}\n`;
  text += `• Avans: ${formatCurrency(order.deposit, order.currency)}\n`;
  text += `• OSTATAK ZA NAPLATU: ${formatCurrency(order.remainingDebt, order.currency)}\n`;

  if (order.installerNotes) {
    text += `\n⚠️ NAPOMENA ZA MONTERE:\n${order.installerNotes}\n`;
  }

  text += `\n📍 Google Maps: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address + ', ' + order.city)}`;

  return text;
}

/**
 * Kompresuje sliku pre čuvanja u localStorage radi brzine i uštede memorije
 */
export function compressImageFile(file: File, maxDimension = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Greška pri čitanju slike'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Greška pri učitavanju slike'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

