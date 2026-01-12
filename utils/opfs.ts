
/**
 * Origin Private File System (OPFS) Manager
 * Provides a high-performance, persistent storage layer for large binary assets (images, PDFs).
 * This layer survives browser cache clearing better than Cache API or localStorage.
 */

export const isOPFSSupported = (): boolean => {
    return typeof navigator !== 'undefined' && 
           !!navigator.storage && 
           !!navigator.storage.getDirectory;
};

const getRoot = async () => {
    return await navigator.storage.getDirectory();
};

/**
 * Saves a Blob to OPFS.
 * @param filename Unique filename (e.g., hash or sanitized URL)
 * @param blob Binary data
 */
export const saveFileToOPFS = async (filename: string, blob: Blob): Promise<string> => {
    try {
        const root = await getRoot();
        // create: true ensures we get a handle, overwriting if exists
        const fileHandle = await root.getFileHandle(filename, { create: true });
        
        // Create a writable stream to the file
        const writable = await fileHandle.createWritable();
        
        // Write the blob
        await writable.write(blob);
        
        // Close the file
        await writable.close();
        
        return filename;
    } catch (error) {
        console.error(`[OPFS] Failed to save file ${filename}:`, error);
        throw error;
    }
};

/**
 * Retrieves a file from OPFS and returns a transient Blob URL.
 * NOTE: The caller is responsible for revoking the URL if needed, 
 * though browsers generally handle blob URL GC reasonably well in SPA contexts.
 */
export const loadFileFromOPFS = async (filename: string): Promise<string | null> => {
    try {
        const root = await getRoot();
        const fileHandle = await root.getFileHandle(filename);
        const file = await fileHandle.getFile();
        return URL.createObjectURL(file);
    } catch (error) {
        // File not found or permission issue
        return null;
    }
};

/**
 * Deletes a file from OPFS.
 */
export const deleteFileFromOPFS = async (filename: string): Promise<void> => {
    try {
        const root = await getRoot();
        await root.removeEntry(filename);
    } catch (error) {
        console.warn(`[OPFS] Failed to delete file ${filename} (might not exist):`, error);
    }
};

/**
 * Sanitizes a URL to be used as a filename.
 */
export const urlToFilename = (url: string): string => {
    // Simple hash-like replacement for filenames
    return url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};
