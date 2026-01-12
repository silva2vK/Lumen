
import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants/index';

export const ZoomControls: React.FC = () => {
    // State to track the current zoom scale factor
    const [scale, setScale] = useState(1);
    const [isOpen, setIsOpen] = useState(false);

    // Effect to set the initial scale based on the CSS variable when the component mounts
    useEffect(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        const currentFontSize = rootStyle.getPropertyValue('--root-font-size').replace('px', '');
        if (currentFontSize && !isNaN(parseFloat(currentFontSize))) {
            setScale(parseFloat(currentFontSize) / 16); // Assuming 16px is the base
        }
    }, []);

    // Function to change the scale, clamped between 75% and 150%
    const changeScale = (delta: number) => {
        const nextScale = Math.min(1.5, Math.max(0.75, +(scale + delta).toFixed(2)));
        setScale(nextScale);
        document.documentElement.style.setProperty('--root-font-size', `${16 * nextScale}px`);
    };

    // Function to reset the scale to 100%
    const resetScale = () => {
        setScale(1);
        document.documentElement.style.setProperty('--root-font-size', '16px');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-11 h-11 bg-black hover:bg-slate-900 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all shadow-sm"
                aria-label="Abrir controles de visualização"
                title="Ajustar visualização"
            >
                {ICONS.controls_sliders}
            </button>
        );
    }

    return (
        <div 
            className="flex items-center space-x-1 bg-black border border-white/20 rounded-full p-1 shadow-xl animate-fade-in" 
            role="group" 
            aria-label="Controles de zoom"
        >
            <button 
                onClick={() => changeScale(-0.1)} 
                disabled={scale <= 0.75}
                className="w-9 h-9 rounded-full text-lg font-bold disabled:opacity-30 text-slate-200 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Diminuir zoom"
            >
                -
            </button>
            <span 
                className="w-12 text-center text-sm font-mono font-semibold text-white/90 tabular-nums flex items-center justify-center"
                aria-live="polite"
            >
                {Math.round(scale * 100)}%
            </span>
            <button 
                onClick={() => changeScale(0.1)} 
                disabled={scale >= 1.5}
                className="w-9 h-9 rounded-full text-lg font-bold disabled:opacity-30 text-slate-200 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Aumentar zoom"
            >
                +
            </button>
            <div className="w-px h-5 bg-white/20 mx-1"></div>
            <button 
                onClick={() => setIsOpen(false)} 
                className="w-9 h-9 rounded-full text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Fechar controles de zoom"
            >
                ✕
            </button>
        </div>
    );
};
