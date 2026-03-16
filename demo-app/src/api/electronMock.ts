// Electron API Mock for browser demo - uses mock data instead of database

// Receipt storage in IndexedDB
const RECEIPTS_STORE = 'receipts';
const RECEIPTS_DB_NAME = 'pilot-car-receipts';
const RECEIPTS_DB_VERSION = 1;

// Initialize receipts IndexedDB
async function initReceiptsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(RECEIPTS_DB_NAME, RECEIPTS_DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(RECEIPTS_STORE)) {
        db.createObjectStore(RECEIPTS_STORE);
      }
    };
  });
}

// Generate device ID for demo
function getDeviceId(): string {
  let deviceId = localStorage.getItem('demo-device-id');
  if (!deviceId) {
    deviceId = 'demo-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('demo-device-id', deviceId);
  }
  return deviceId;
}

// File input helper
function selectFile(accept?: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      resolve(file);
    };
    input.click();
  });
}

// Convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Create Electron API mock
export function createElectronAPIMock() {
  const deviceId = getDeviceId();

  const electronAPI = {
    // Database operations - mocked for demo (no actual database)
    dbQuery: async (_queryStr: string, _params?: any[]): Promise<any> => {
      // Return empty result for demo
      return [];
    },

    dbTransaction: async (_queries: Array<{ query: string; params: any[] }>): Promise<any[]> => {
      // Return empty results for demo
      return [];
    },

    // Backup operations (mocked)
    backupDatabase: async () => {
      alert("This is a demo. Saving, syncing, and OCR are available in the full app.");
      return {
        success: false,
        error: 'Backup not available in demo mode',
        message: 'Backup not available in demo mode',
      };
    },

    backupDatabaseToLocation: async () => {
      return electronAPI.backupDatabase();
    },

    restoreDatabase: async (_backupPath: string): Promise<void> => {
      alert("This is a demo. Saving, syncing, and OCR are available in the full app.");
      throw new Error('Restore not available in demo mode');
    },

    selectBackupFile: async (): Promise<string | null> => {
      const file = await selectFile('.db');
      if (!file) return null;
      return file.name;
    },

    getBackupFiles: async () => {
      return [];
    },

    openBackupsFolder: async (): Promise<void> => {
      // No-op in browser
    },

    // Receipt operations
    receiptSave: async (base64Data: string, filename: string, receiptDate?: string) => {
      const db = await initReceiptsDB();
      const relativePath = `${receiptDate || new Date().toISOString().split('T')[0]}/${filename}`;
      
      return new Promise<{ filePath: string; relativePath: string }>((resolve, reject) => {
        const transaction = db.transaction([RECEIPTS_STORE], 'readwrite');
        const store = transaction.objectStore(RECEIPTS_STORE);
        const request = store.put(base64Data, relativePath);
        
        request.onsuccess = () => {
          resolve({
            filePath: relativePath,
            relativePath: relativePath,
          });
        };
        request.onerror = () => reject(request.error);
      });
    },

    receiptRead: async (relativePath: string): Promise<string> => {
      const db = await initReceiptsDB();
      
      return new Promise<string>((resolve, reject) => {
        const transaction = db.transaction([RECEIPTS_STORE], 'readonly');
        const store = transaction.objectStore(RECEIPTS_STORE);
        const request = store.get(relativePath);
        
        request.onsuccess = () => {
          const data = request.result;
          if (data) {
            resolve(`data:image/jpeg;base64,${data}`);
          } else {
            reject(new Error('Receipt not found'));
          }
        };
        request.onerror = () => reject(request.error);
      });
    },

    receiptDelete: async (relativePath: string) => {
      const db = await initReceiptsDB();
      
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([RECEIPTS_STORE], 'readwrite');
        const store = transaction.objectStore(RECEIPTS_STORE);
        const request = store.delete(relativePath);
        
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    },

    receiptSelectFile: async () => {
      const file = await selectFile('image/*');
      if (!file) return null;
      
      const base64 = await fileToBase64(file);
      return {
        filename: file.name,
        data: base64.split(',')[1], // Remove data URL prefix
        mimeType: file.type,
      };
    },

    receiptGetAbsolutePath: async (relativePath: string) => {
      return relativePath; // In browser, just return relative path
    },

    // Dev tools (no-op in browser)
    toggleDevTools: async () => {
      return { opened: false };
    },

    // Tesseract paths (use CDN)
    getTesseractWorkerPath: async () => {
      return 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.0/dist/worker.min.js';
    },

    getTesseractCorePath: async () => {
      return 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core.wasm.js';
    },

    getTesseractLangPath: async () => {
      return 'https://tessdata.projectnaptha.com/4.0.0';
    },

    // Authentication operations (using localStorage)
    authLogin: async (password: string) => {
      const storedHash = localStorage.getItem('demo-password-hash');
      if (!storedHash) {
        // First time - set password
        localStorage.setItem('demo-password-hash', btoa(password));
        localStorage.setItem('demo-session', 'active');
        return { success: true };
      }
      
      // Check password (simple base64 comparison for demo)
      if (btoa(password) === storedHash) {
        localStorage.setItem('demo-session', 'active');
        return { success: true };
      }
      
      return { success: false, error: 'Invalid password' };
    },

    authLogout: async () => {
      localStorage.removeItem('demo-session');
      return { success: true };
    },

    authCheckSession: async () => {
      const session = localStorage.getItem('demo-session');
      return { authenticated: session === 'active' };
    },

    authSetPassword: async (password: string) => {
      localStorage.setItem('demo-password-hash', btoa(password));
      localStorage.setItem('demo-session', 'active');
      return { success: true, recoveryKey: 'DEMO-RECOVERY-KEY' };
    },

    authResetPassword: async (_recoveryKey: string, newPassword: string, confirmPassword: string) => {
      if (newPassword !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }
      localStorage.setItem('demo-password-hash', btoa(newPassword));
      return { success: true };
    },

    authResetPasswordWithQuestions: async (_answer1: string, _answer2: string, newPassword: string) => {
      localStorage.setItem('demo-password-hash', btoa(newPassword));
      return { success: true };
    },

    authGenerateRecoveryKey: async () => {
      const key = 'DEMO-' + Math.random().toString(36).substring(2, 15).toUpperCase();
      return { success: true, recoveryKey: key };
    },

    authGetRecoveryKey: async () => {
      return 'DEMO-RECOVERY-KEY';
    },

    authIsPasswordSet: async () => {
      return !!localStorage.getItem('demo-password-hash');
    },

    authChangePassword: async (currentPassword: string, newPassword: string) => {
      const storedHash = localStorage.getItem('demo-password-hash');
      if (btoa(currentPassword) !== storedHash) {
        return { success: false, error: 'Current password is incorrect' };
      }
      localStorage.setItem('demo-password-hash', btoa(newPassword));
      return { success: true };
    },

    // Sync operations (mocked - no-op for demo)
    syncSyncAll: async () => {
      alert("This is a demo. Saving, syncing, and OCR are available in the full app.");
      return {
        success: false,
        syncedTables: [],
        conflicts: 0,
        error: 'Sync not available in demo mode',
      };
    },

    syncGetStatus: async () => {
      return {
        enabled: false,
        status: 'idle' as const,
      };
    },

    syncGetDeviceId: async () => {
      return deviceId;
    },

    syncGetDiscoveredDevices: async () => {
      return [];
    },

    syncHasDiscoveredDevices: async () => {
      return false;
    },

    syncGetHubClients: async () => {
      return [];
    },

    syncGetHubAddress: async () => {
      return null;
    },

    // License operations (always valid for demo)
    licenseActivate: async (licenseKey: string) => {
      localStorage.setItem('demo-license-key', licenseKey);
      localStorage.setItem('demo-license-activated', 'true');
      return { success: true };
    },

    licenseValidate: async () => {
      const activated = localStorage.getItem('demo-license-activated');
      return {
        valid: activated === 'true',
        error: activated !== 'true' ? 'License not activated' : undefined,
      };
    },

    licenseGetDeviceId: async () => {
      return deviceId;
    },

    licenseIsActivated: async () => {
      return localStorage.getItem('demo-license-activated') === 'true';
    },

    // Database change notifications (mocked)
    onDatabaseChanged: (_callback: (tableName: string) => void) => {
      // In browser, we can't easily detect database changes
      // This is a no-op for demo
    },

    removeDatabaseChangedListener: () => {
      // No-op
    },

    // Session management
    onClearSession: (callback: () => void) => {
      // Listen for storage events
      window.addEventListener('storage', (e) => {
        if (e.key === 'demo-session-cleared') {
          callback();
        }
      });
    },

    removeClearSessionListener: () => {
      // No-op
    },
  };

  // Attach to window
  (window as any).electronAPI = electronAPI;

  return electronAPI;
}

// Type declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: ReturnType<typeof createElectronAPIMock>;
  }
}
