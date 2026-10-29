import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { WorkOrder, Client, CatalogSettings } from '../types';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (never stored in localStorage/sessionStorage as required)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveBackupPayload {
  version: string;
  savedAt: string;
  sourceDevice: string;
  orders: WorkOrder[];
  clients: Client[];
  catalogs: CatalogSettings;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

/**
 * Initialize auth listener
 */
export const initAuthListener = (
  onSuccess?: (user: User, token: string | null) => void,
  onSignedOut?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onSuccess) onSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onSignedOut) onSignedOut();
    }
  });
};

/**
 * Sign in with Google Popup
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Nije moguće preuzeti pristupni token sa Google naloga.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out
 */
export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Get current in-memory access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;

  // If user is logged in but memory token cleared (e.g. after refresh), re-prompt popup sign-in
  if (auth.currentUser && !isSigningIn) {
    try {
      const res = await googleSignIn();
      return res.accessToken;
    } catch {
      return null;
    }
  }
  return null;
};

const BACKUP_FILENAME = 'vratamaster-backup.json';

/**
 * Find existing backup file on Google Drive
 */
export const findExistingBackupFile = async (token: string): Promise<DriveFileInfo | null> => {
  const query = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&spaces=drive`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Greška pri proveri Google Drive fajla (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0] as DriveFileInfo;
  }
  return null;
};

/**
 * Save / upload backup to Google Drive
 */
export const saveBackupToGoogleDrive = async (
  token: string, 
  payload: { orders: WorkOrder[]; clients: Client[]; catalogs: CatalogSettings }
): Promise<{ fileId: string; modifiedTime: string }> => {
  const fullBackupData: DriveBackupPayload = {
    version: '1.0',
    savedAt: new Date().toISOString(),
    sourceDevice: navigator.userAgent.includes('Mobile') ? 'Mobilni telefon' : 'Desktop računar',
    orders: payload.orders,
    clients: payload.clients,
    catalogs: payload.catalogs
  };

  const jsonContent = JSON.stringify(fullBackupData, null, 2);

  // Check if file already exists
  const existingFile = await findExistingBackupFile(token);

  if (existingFile) {
    // Update existing file content
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
    const res = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: jsonContent
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Neuspešno ažuriranje backup fajla na Google Drive-u: ${err}`);
    }

    const updated = await res.json();
    return { fileId: updated.id || existingFile.id, modifiedTime: new Date().toISOString() };
  } else {
    // Create new file with multipart upload
    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
      description: 'VrataMaster sinhronizacija i rezervna kopija podataka'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      jsonContent +
      closeDelimiter;

    const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Neuspešno kreiranje fajla na Google Drive-u: ${err}`);
    }

    const created = await res.json();
    return { fileId: created.id, modifiedTime: new Date().toISOString() };
  }
};

/**
 * Load / download backup from Google Drive
 */
export const loadBackupFromGoogleDrive = async (token: string): Promise<DriveBackupPayload> => {
  const existingFile = await findExistingBackupFile(token);
  if (!existingFile) {
    throw new Error('Na vašem Google Drive-u još uvek ne postoji sačuvana rezervna kopija VrataMaster-a.');
  }

  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`;
  const res = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Neuspešno preuzimanje backup-a sa Google Drive-a: ${err}`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.orders)) {
    throw new Error('Preuzeti fajl sa Google Drive-a nema ispravan format VrataMaster podataka.');
  }

  return data as DriveBackupPayload;
};
