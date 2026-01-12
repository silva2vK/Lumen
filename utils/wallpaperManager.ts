
import { get, set, del } from 'idb-keyval';

const WALLPAPER_KEY = 'lumen_wallpaper_blob';

export const saveWallpaper = async (file: File): Promise<void> => {
    try {
        await set(WALLPAPER_KEY, file);
    } catch (error) {
        console.error("Failed to save wallpaper:", error);
        throw error;
    }
};

export const getWallpaper = async (): Promise<string | null> => {
    try {
        const blob = await get<File>(WALLPAPER_KEY);
        if (blob) {
            return URL.createObjectURL(blob);
        }
        return null;
    } catch (error) {
        console.error("Failed to get wallpaper:", error);
        return null;
    }
};

export const deleteWallpaper = async (): Promise<void> => {
    try {
        await del(WALLPAPER_KEY);
    } catch (error) {
        console.error("Failed to delete wallpaper:", error);
    }
};
