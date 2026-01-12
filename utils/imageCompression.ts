
import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file on the client side before upload.
 * Optimizes for Firebase/Supabase Storage by converting to WebP and reducing size.
 */
export const compressImage = async (file: File): Promise<File> => {
    // 1. Validation: Max Input Size (7MB)
    const MAX_INPUT_SIZE_MB = 7;
    if (file.size > MAX_INPUT_SIZE_MB * 1024 * 1024) {
        throw new Error(`A imagem excede o limite de ${MAX_INPUT_SIZE_MB}MB. Por favor, escolha um arquivo menor.`);
    }

    // If it's not an image, return original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Do not compress if extremely small (< 50KB)
    if (file.size <= 51200) {
        return file;
    }

    // 2. Aggressive Compression Settings for Cloud Cost Saving
    const options = {
        maxSizeMB: 1, // Target: 1MB Max Output (Great balance for HD screens vs Storage cost)
        maxWidthOrHeight: 1920, // Full HD max
        useWebWorker: true,
        fileType: 'image/webp', // Modern format, typically 30% smaller than JPEG
        initialQuality: 0.75
    };

    try {
        console.log(`Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);
        const compressedFile = await imageCompression(file, options);
        
        // Safety check: ensure we define the file name correctly on the blob if needed, 
        // though browser-image-compression returns a File object usually.
        
        console.log(`Compressed to ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        return compressedFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        // If compression fails but size is under limit, return original. 
        // If over limit, we throw to prevent huge uploads.
        if (file.size > MAX_INPUT_SIZE_MB * 1024 * 1024) {
             throw new Error("Falha na compressão e imagem original é muito grande.");
        }
        return file;
    }
};
