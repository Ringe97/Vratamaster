import React, { useState } from 'react';
import { 
  Sliders, 
  DoorClosed, 
  Palette, 
  Lock, 
  Layers, 
  MapPin, 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  RotateCcw,
  Cloud,
  HardDrive
} from 'lucide-react';
import { CatalogSettings, WorkOrder, Client } from '../types';
import { DEFAULT_CATALOGS } from '../utils/orderUtils';
import { GoogleDriveSyncCard } from './GoogleDriveSyncCard';

interface SettingsViewProps {
  catalogs: CatalogSettings;
  onSaveCatalogs: (updated: CatalogSettings) => void;
  orders: WorkOrder[];
  clients: Client[];
  onRestoreBackup: (backup: { orders: WorkOrder[]; clients: Client[]; catalogs: CatalogSettings }) => void;
}

type SettingsSection = 'sifarnici' | 'drive';
type CatalogCategory = 'doorModels' | 'decors' | 'lockTypes' | 'thresholdTypes' | 'cities' | 'quickNotes';

export const SettingsView: React.FC<SettingsViewProps> = ({
  catalogs,
  onSaveCatalogs,
  orders,
  clients,
  onRestoreBackup
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('sifarnici');
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>('doorModels');
  const [newItemText, setNewItemText] = useState('');
  
  // Inline editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categoryMeta: Record<CatalogCategory, { title: string; subtitle: string; icon: any; placeholder: string }> = {
    doorModels: {
      title: 'Modeli Vrata',
      subtitle: 'CPL, Medijapan gravirani, Furnir, Kraft Master...',
      icon: DoorClosed,
      placeholder: 'npr. Medijapan sa 3D kanelurama'
    },
    decors: {
      title: 'Dekori i Boje Folija',
      subtitle: 'Beli Jasen, Hrast Sonoma, Antracit, Wenge...',
      icon: Palette,
      placeholder: 'npr. Hrast San Remo'
    },
    lockTypes: {
      title: 'Brave i Okovi',
      subtitle: 'Običan ključ, WC leptir bravica, Cilindar, Magnetna brava...',
      icon: Lock,
      placeholder: 'npr. Magnetna brava sa skrivenim prihvatnikom'
    },
    thresholdTypes: {
      title: 'Pragovi i Završne Lajsne',
      subtitle: 'Bez praga, Padajući prag, Drveni prag, Alu lajsna...',
      icon: Layers,
      placeholder: 'npr. Padajući gumeni automatski prag'
    },
    cities: {
      title: 'Gradovi i Opštine',
      subtitle: 'Niš, Aleksinac, Sokobanja, Prokuplje...',
      icon: MapPin,
      placeholder: 'npr. Vranje'
    },
    quickNotes: {
      title: 'Brze Napomene za Montažu',
      subtitle: 'Demontaža starih vrata, kriv zid, podsecanje...',
      icon: FileText,
      placeholder: 'npr. Podrezati pervajz lajsnu na licu mesta'
    }
  };

  const currentList: string[] = catalogs[activeCategory] || [];

  // Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmed = newItemText.trim();
    if (!trimmed) return;

    if (currentList.includes(trimmed)) {
      setErrorMessage('Ova stavka već postoji u šifarniku.');
      return;
    }

    const updated = {
      ...catalogs,
      [activeCategory]: [...currentList, trimmed]
    };

    onSaveCatalogs(updated);
    setNewItemText('');
  };

  // Delete Item
  const handleDeleteItem = (indexToDelete: number) => {
    const updatedList = currentList.filter((_, idx) => idx !== indexToDelete);
    onSaveCatalogs({
      ...catalogs,
      [activeCategory]: updatedList
    });
  };

  // Start Edit
  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(currentList[index]);
  };

  // Save Edit
  const handleSaveEdit = (index: number) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;

    const updatedList = [...currentList];
    updatedList[index] = trimmed;

    onSaveCatalogs({
      ...catalogs,
      [activeCategory]: updatedList
    });

    setEditingIndex(null);
    setEditingValue('');
  };

  // Reset category to defaults
  const handleResetCategory = () => {
    onSaveCatalogs({
      ...catalogs,
      [activeCategory]: DEFAULT_CATALOGS[activeCategory]
    });
  };

  const CurrentIcon = categoryMeta[activeCategory].icon;

  return (
    <div className="space-y-4 pb-6">
      
      {/* Top Main Navigation for Settings Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Podešavanja & Sinhronizacija</h2>
              <p className="text-xs text-zinc-500">Šifarnici vrata i Google Drive sinhronizacija</p>
            </div>
          </div>
        </div>

        {/* 2 Main Settings Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
          <button
            onClick={() => setActiveSection('sifarnici')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'sifarnici'
                ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Šifarnici</span>
          </button>

          <button
            onClick={() => setActiveSection('drive')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'drive'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span>Google Drive</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: GOOGLE DRIVE BACKUP & RESTORE */}
      {activeSection === 'drive' && (
        <GoogleDriveSyncCard
          orders={orders}
          clients={clients}
          catalogs={catalogs}
          onRestoreBackup={onRestoreBackup}
        />
      )}

      {/* SECTION 3: ŠIFARNICI I KATALOZI (EXISTING) */}
      {activeSection === 'sifarnici' && (
        <>
          {/* Category Navigation Pills (Horizontal scroll on phone) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {(Object.keys(categoryMeta) as CatalogCategory[]).map(key => {
              const Icon = categoryMeta[key].icon;
              const isSelected = activeCategory === key;
              const count = (catalogs[key] || []).length;

              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key);
                    setEditingIndex(null);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{categoryMeta[key].title}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Category Editor Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            
            {/* Category Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-amber-500 flex items-center justify-center">
                  <CurrentIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {categoryMeta[activeCategory].title} ({currentList.length})
                  </h3>
                  <p className="text-[11px] text-zinc-500">{categoryMeta[activeCategory].subtitle}</p>
                </div>
              </div>

              <button
                onClick={handleResetCategory}
                title="Vrati fabričke stavke za ovu kategoriju"
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-amber-500 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Fabričke vrednosti</span>
              </button>
            </div>

            {/* Add New Item Input */}
            <form onSubmit={handleAddItem} className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => {
                    setNewItemText(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={categoryMeta[activeCategory].placeholder}
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Dodaj</span>
                </button>
              </div>
              {errorMessage && (
                <p className="text-xs text-rose-500 font-medium pl-1">{errorMessage}</p>
              )}
            </form>

            {/* List of items */}
            <div className="space-y-1.5 pt-1 max-h-[50vh] overflow-y-auto">
              {currentList.map((item, index) => {
                const isEditing = editingIndex === index;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs transition-colors"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-amber-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(index)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md"
                          title="Sačuvaj"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="p-1.5 text-zinc-400 hover:bg-zinc-200 rounded-md"
                          title="Otkaži"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {item}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={() => handleStartEdit(index)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            title="Izmeni stavku"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Obriši stavku"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-zinc-500 italic bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
              💡 Sve izmene se automatski čuvaju i biće odmah dostupne u padajućim menijima pri unosu i izmeni novih radnih naloga.
            </div>

          </div>
        </>
      )}

    </div>
  );
};
