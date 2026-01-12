
import { set, get, del, keys } from 'idb-keyval';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebaseClient';
import type { Module, ModulePage } from '../types';
import { saveFileToOPFS, loadFileFromOPFS, deleteFileFromOPFS, urlToFilename, isOPFSSupported } from './opfs';

const OFFLINE_PREFIX = 'offline_module_';
const CACHE_NAME = 'offline-media-v1';

export interface OfflineModuleData {
    module: Module;
    pages: ModulePage[];
    assetMap?: Record<string, string>; // Maps original URL -> OPFS Filename
    savedAt: number;
}

// Helper: Extract image URLs from module pages
const extractImageUrls = (pages: ModulePage[]): string[] => {
    const urls: string[] = [];
    pages.forEach(page => {
        page.content.forEach(block => {
            if (block.type === 'image' && typeof block.content === 'string' && block.content.startsWith('http')) {
                urls.push(block.content);
            }
        });
    });
    return urls;
};

/**
 * Saves a module and its content for offline use.
 * Strategy:
 * 1. Fetch metadata/content.
 * 2. Try OPFS for media (Critical Improvement).
 * 3. Fallback to Cache API if OPFS fails.
 * 4. Save structure to IndexedDB.
 */
export const saveModuleOffline = async (module: Module): Promise<void> => {
    try {
        // 1. Fetch full content
        const contentRef = doc(db, 'module_contents', module.id);
        const contentSnap = await getDoc(contentRef);
        
        let pages: ModulePage[] = [];
        if (contentSnap.exists()) {
            pages = contentSnap.data().pages as ModulePage[];
        } else if (module.pages && module.pages.length > 0) {
            pages = module.pages;
        } else {
            throw new Error("Conteúdo do módulo não encontrado.");
        }

        const imageUrls = extractImageUrls(pages);
        if (module.coverImageUrl && module.coverImageUrl.startsWith('http')) {
            imageUrls.push(module.coverImageUrl);
        }

        const assetMap: Record<string, string> = {};
        const useOPFS = isOPFSSupported();
        const cache = useOPFS ? null : await caches.open(CACHE_NAME);

        // 2. Download and Store Assets
        const downloadPromises = imageUrls.map(async (url) => {
            try {
                const response = await fetch(url, { mode: 'cors' });
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                const blob = await response.blob();

                if (useOPFS) {
                    const filename = `${module.id}_${urlToFilename(url)}`;
                    await saveFileToOPFS(filename, blob);
                    assetMap[url] = filename;
                } else if (cache) {
                    // Fallback to Cache API
                    await cache.put(url, new Response(blob));
                }
            } catch (e) {
                console.warn(`[Offline] Failed to save asset: ${url}`, e);
            }
        });
        
        await Promise.all(downloadPromises);

        // 3. Save Metadata to IndexedDB
        const offlineData: OfflineModuleData = {
            module: { ...module, downloadState: 'downloaded' },
            pages,
            assetMap: useOPFS ? assetMap : undefined,
            savedAt: Date.now()
        };

        await set(`${OFFLINE_PREFIX}${module.id}`, offlineData);
        console.log(`[Offline] Module ${module.id} saved successfully (${useOPFS ? 'OPFS' : 'Cache API'}).`);

    } catch (error) {
        console.error("[Offline] Error saving module:", error);
        throw error;
    }
};

/**
 * Retrieves a module from storage.
 * Hydrates asset URLs from OPFS if applicable.
 */
export const getOfflineModule = async (moduleId: string): Promise<OfflineModuleData | null> => {
    try {
        const data = await get<OfflineModuleData>(`${OFFLINE_PREFIX}${moduleId}`);
        if (!data) return null;

        // Hydrate OPFS assets into Blob URLs
        if (data.assetMap && isOPFSSupported()) {
            const hydratePages = async () => {
                // Clone pages to avoid mutating IDB reference directly (though we act on a copy usually)
                const newPages = JSON.parse(JSON.stringify(data.pages));
                
                // Hydrate Cover Image
                if (data.module.coverImageUrl && data.assetMap![data.module.coverImageUrl]) {
                    const blobUrl = await loadFileFromOPFS(data.assetMap![data.module.coverImageUrl]);
                    if (blobUrl) data.module.coverImageUrl = blobUrl;
                }

                // Hydrate Content Images
                for (const page of newPages) {
                    for (const block of page.content) {
                        if (block.type === 'image' && typeof block.content === 'string') {
                            const filename = data.assetMap![block.content];
                            if (filename) {
                                const blobUrl = await loadFileFromOPFS(filename);
                                if (blobUrl) block.content = blobUrl;
                            }
                        }
                    }
                }
                return newPages;
            };

            data.pages = await hydratePages();
        }

        return data;
    } catch (error) {
        console.error("[Offline] Error retrieving module:", error);
        return null;
    }
};

/**
 * Removes a module from offline storage and cleans up OPFS/Cache.
 */
export const removeModuleOffline = async (moduleId: string): Promise<void> => {
    try {
        const data = await get<OfflineModuleData>(`${OFFLINE_PREFIX}${moduleId}`);
        
        if (data) {
            // Cleanup OPFS
            if (data.assetMap && isOPFSSupported()) {
                const deletePromises = Object.values(data.assetMap).map((filename: string) => 
                    deleteFileFromOPFS(filename)
                );
                await Promise.all(deletePromises);
            }
            // Cleanup Cache API (Best effort)
            else {
                const cache = await caches.open(CACHE_NAME);
                const imageUrls = extractImageUrls(data.pages);
                if (data.module.coverImageUrl) imageUrls.push(data.module.coverImageUrl);
                // Note: Deleting from shared cache is risky if assets are shared. 
                // In Phase 2, we implement reference counting. For now, we skip Cache deletion to be safe.
            }
        }

        await del(`${OFFLINE_PREFIX}${moduleId}`);
        console.log(`[Offline] Module ${moduleId} removed.`);
    } catch (error) {
        console.error("[Offline] Error removing module:", error);
        throw error;
    }
};

export const isModuleOffline = async (moduleId: string): Promise<boolean> => {
    const keysArray = await keys();
    return keysArray.some(k => String(k) === `${OFFLINE_PREFIX}${moduleId}`);
};

export const listOfflineModules = async (): Promise<Module[]> => {
    const keysArray = await keys();
    const moduleKeys = keysArray.filter((k): k is string => typeof k === 'string' && k.startsWith(OFFLINE_PREFIX));
    
    const modules: Module[] = [];
    for (const k of moduleKeys) {
        const data = await get<OfflineModuleData>(k);
        if (data) modules.push(data.module);
    }
    return modules;
};
