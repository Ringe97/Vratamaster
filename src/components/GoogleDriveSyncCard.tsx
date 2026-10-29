import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  LogOut, 
  Database, 
  Check, 
  X, 
  ShieldCheck, 
  Clock,
  HardDrive
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuthListener, 
  googleSignIn, 
  googleSignOut, 
  getAccessToken, 
  saveBackupToGoogleDrive, 
  loadBackupFromGoogleDrive, 
  findExistingBackupFile,
  DriveBackupPayload,
  DriveFileInfo
} from '../services/googleDriveService';
import { WorkOrder, Client, CatalogSettings } from '../types';

interface GoogleDriveSyncCardProps {
  orders: WorkOrder[];
  clients: Client[];
  catalogs: CatalogSettings;
  onRestoreBackup: (backup: { orders: WorkOrder[]; clients: Client[]; catalogs: CatalogSettings }) => void;
}

export const GoogleDriveSyncCard: React.FC<GoogleDriveSyncCardProps> = ({
  orders,
  clients,
  catalogs,
  onRestoreBackup
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFromDrive, setIsLoadingFromDrive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Existing backup file metadata on Drive
  const [existingFile, setExistingFile] = useState<DriveFileInfo | null>(null);
  const [isCheckingFile, setIsCheckingFile] = useState(false);

  // Restore Confirmation Modal
  const [pendingRestoreData, setPendingRestoreData] = useState<DriveBackupPayload | null>(null);

  useEffect(() => {
    const unsubscribe = initAuthListener(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        if (currentToken) {
          checkExistingFile(currentToken);
        }
      },
      () => {
        setUser(null);
        setToken(null);
        setExistingFile(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const checkExistingFile = async (accessToken: string) => {
    setIsCheckingFile(true);
    try {
      const file = await findExistingBackupFile(accessToken);
      setExistingFile(file);
    } catch (err: any) {
      console.warn('Check file warn:', err);
    } finally {
      setIsCheckingFile(false);
    }
  };

  const handleLogin = async () => {
    setIsLoadingAuth(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      setUser(result.user);
      setToken(result.accessToken);
      setStatusMessage({
        type: 'success',
        text: `Uspešno povezano sa Google nalogom (${result.user.email})!`
      });
      await checkExistingFile(result.accessToken);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Neuspešno povezivanje sa Google nalogom.'
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
    setExistingFile(null);
    setStatusMessage({
      type: 'info',
      text: 'Odjavljeni ste sa Google naloga.'
    });
  };

  // Save to Google Drive
  const handleSaveToDrive = async () => {
    setStatusMessage(null);
    setIsSaving(true);
    try {
      let activeToken = token;
      if (!activeToken) {
        activeToken = await getAccessToken();
      }
      if (!activeToken) {
        throw new Error('Potrebno je da se prvo prijavite na Google nalog.');
      }

      const res = await saveBackupToGoogleDrive(activeToken, { orders, clients, catalogs });
      setStatusMessage({
        type: 'success',
        text: `Podaci uspešno sačuvani na Google Drive! (${orders.length} naloga, ${clients.length} klijenata)`
      });
      await checkExistingFile(activeToken);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Greška pri čuvanju na Google Drive.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch and show confirmation before loading from Google Drive
  const handleLoadFromDrive = async () => {
    setStatusMessage(null);
    setIsLoadingFromDrive(true);
    try {
      let activeToken = token;
      if (!activeToken) {
        activeToken = await getAccessToken();
      }
      if (!activeToken) {
        throw new Error('Potrebno je da se prvo prijavite na Google nalog.');
      }

      const backup = await loadBackupFromGoogleDrive(activeToken);
      setPendingRestoreData(backup);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Greška pri preuzimanju sa Google Drive-a.'
      });
    } finally {
      setIsLoadingFromDrive(false);
    }
  };

  // Confirm Restore
  const confirmRestore = () => {
    if (!pendingRestoreData) return;
    onRestoreBackup({
      orders: pendingRestoreData.orders,
      clients: pendingRestoreData.clients,
      catalogs: pendingRestoreData.catalogs
    });
    setStatusMessage({
      type: 'success',
      text: `Uspešno učitani podaci sa Google Drive-a! (${pendingRestoreData.orders.length} naloga, ${pendingRestoreData.clients.length} klijenata)`
    });
    setPendingRestoreData(null);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Google Drive Sinhronizacija</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Cloud Backup
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500">
              Sinhronizujte podatke između telefona i računara putem vašeg Google Drive-a
            </p>
          </div>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            title="Odjavi Google nalog"
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Odjavi se</span>
          </button>
        )}
      </div>

      {/* Auth state box */}
      {!user ? (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Povežite vaš Google nalog
              </h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                Podaci se trenutno čuvaju lokalno na ovom uređaju. Povezivanjem sa Google Drive-om možete jednim klikom napraviti sigurnosnu kopiju i preneti sve naloge na drugi telefon ili laptop.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoadingAuth}
            className="w-full py-2.5 px-4 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-2.5 shadow-xs active:scale-98 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isLoadingAuth ? 'Povezivanje...' : 'Poveži se sa Google nalogom'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* User Connected Card */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-blue-300 dark:border-blue-700" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                  {user.displayName || 'Google Korisnik'}
                </span>
                <span className="text-[11px] text-zinc-500 truncate block">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Povezan</span>
            </div>
          </div>

          {/* Drive Status Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Lokalno na uređaju</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                {orders.length} naloga • {clients.length} klijenata
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Fajl na Google Drive-u</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                {isCheckingFile ? (
                  <span className="text-zinc-400">Provera...</span>
                ) : existingFile ? (
                  <span className="text-emerald-600 dark:text-emerald-400 truncate block">
                    ✓ {new Date(existingFile.modifiedTime).toLocaleDateString('sr-RS')}
                  </span>
                ) : (
                  <span className="text-amber-500">Još nije sačuvano</span>
                )}
              </span>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            
            {/* Sačuvaj na Google Drive */}
            <button
              onClick={handleSaveToDrive}
              disabled={isSaving}
              className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Čuvanje na Drive...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Sačuvaj na Google Drive</span>
                </>
              )}
            </button>

            {/* Učitaj sa Google Drive-a */}
            <button
              onClick={handleLoadFromDrive}
              disabled={isLoadingFromDrive}
              className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isLoadingFromDrive ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Preuzimanje...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4 text-blue-500" />
                  <span>Učitaj sa Google Drive-a</span>
                </>
              )}
            </button>

          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed italic">
            💡 Podaci se čuvaju kao JSON datoteka <code className="font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">vratamaster-backup.json</code> na vašem privatnom Google Drive-u. Samo ova aplikacija ima pristup tom fajlu.
          </p>

        </div>
      )}

      {/* Status banner */}
      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'
            : statusMessage.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          )}
          <span className="flex-1 leading-relaxed">{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Restore Confirmation Dialog (Safe Mutation Guard) */}
      {pendingRestoreData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:pb-5 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            
            {/* Mobile Sheet Handle */}
            <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto -mt-2 mb-1 sm:hidden shrink-0" />

            <div className="flex items-center gap-2.5 text-amber-600 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Potvrda učitavanja sa Google Drive-a
              </h3>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Pronađena je rezervna kopija sačuvana dana{' '}
              <strong>{new Date(pendingRestoreData.savedAt).toLocaleString('sr-RS')}</strong> sa uređaja{' '}
              <strong>{pendingRestoreData.sourceDevice || 'Google Drive'}</strong>.
            </p>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                Sadržaj rezervne kopije:
              </span>
              <ul className="list-disc list-inside text-amber-950 dark:text-amber-300 text-[11px] space-y-0.5">
                <li>{pendingRestoreData.orders.length} radnih naloga</li>
                <li>{pendingRestoreData.clients.length} klijenata</li>
                <li>Kompletni šifarnici modela vrata i dekora</li>
              </ul>
              <span className="text-[10px] text-amber-800 dark:text-amber-400 block pt-1">
                ⚠️ Učitavanjem će lokalna baza na ovom uređaju biti zamenjena podacima sa Drive-a.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingRestoreData(null)}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
              >
                Otkaži
              </button>

              <button
                type="button"
                onClick={confirmRestore}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm"
              >
                Učitaj i primeni
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
