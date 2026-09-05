// IndexedDB storage for local high-capacity video files (bypasses 5MB localStorage limit)

const DB_NAME = 'kv_media_db';
const STORE_NAME = 'video_blobs';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save video File / Blob into IndexedDB
 */
export async function saveVideoToIndexedDB(key, fileOrBlob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(fileOrBlob, key);
    req.onsuccess = () => resolve(`idb://${key}`);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve video Blob from IndexedDB and return an object URL
 */
export async function getVideoFromIndexedDB(key) {
  const cleanKey = key.replace(/^idb:\/\//, '');
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(cleanKey);
    req.onsuccess = () => {
      const blob = req.result;
      if (blob instanceof Blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete a video blob from IndexedDB
 */
export async function deleteVideoFromIndexedDB(key) {
  const cleanKey = key.replace(/^idb:\/\//, '');
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(cleanKey);
  } catch (e) {
    console.warn('Could not delete from IndexedDB:', e);
  }
}
