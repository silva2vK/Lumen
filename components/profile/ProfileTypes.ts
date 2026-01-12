
import React from 'react';

export interface ProfileViewProps {
    user: any;
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    name: string; setName: (v: string) => void;
    series: string; setSeries: (v: string) => void;
    avatarUrl: string; setAvatarUrl: (v: string) => void;
    handleSave: () => void;
    handleAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploadingAvatar: boolean;
    handleWallpaperChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploadingWallpaper: boolean;
    wallpaper: string | null;
    removeWallpaper: () => void;
}
