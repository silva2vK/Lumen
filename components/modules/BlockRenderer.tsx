
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ModulePageContent } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

// Helper to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const SafeImage: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
    const [hasError, setHasError] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullScreen(false);
        };
        if (isFullScreen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isFullScreen]);

    if (hasError || !src) {
        return (
            <div className={`${className} my-4 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg aspect-video max-h-96 mx-auto`}>
                <div className="text-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-xs mt-2 font-semibold">Não foi possível carregar a imagem.</p>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <img 
                src={src} 
                alt={alt} 
                className={`${className} cursor-zoom-in hover:brightness-110 transition-all duration-300`} 
                loading="lazy" 
                onError={() => setHasError(true)} 
                crossOrigin="anonymous" 
                onDoubleClick={() => setIsFullScreen(true)}
                title="Duplo clique para tela cheia"
            />
            {isFullScreen && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center cursor-zoom-out animate-fade-in p-4"
                    onClick={() => setIsFullScreen(false)}
                >
                    <div className="relative max-w-full max-h-full flex items-center justify-center">
                        <img 
                            src={src} 
                            alt={alt} 
                            className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl rounded-sm select-none" 
                        />
                        <button 
                            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            onClick={() => setIsFullScreen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-mono bg-black/50 px-4 py-2 rounded-full pointer-events-none border border-white/10 backdrop-blur-sm">
                        ESC ou Clique para fechar
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export const BlockRenderer: React.FC<{ content: ModulePageContent[] }> = React.memo(({ content }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="prose prose-slate dark:prose-invert max-w-none hc-text-override">
            {content.map((item, index) => {
                const alignMap: Record<string, string> = {
                    left: 'text-left',
                    center: 'text-center',
                    right: 'text-right',
                    justify: 'text-justify'
                };
                const alignClass = item.align ? alignMap[item.align] : 'text-left';
                
                const textStyle = { color: item.color };

                switch (item.type) {
                    case 'title':
                        return <h3 key={index} style={textStyle} className={`text-3xl font-bold !mb-4 !mt-6 first:!mt-0 ${alignClass}`}>{item.content}</h3>;
                    case 'subtitle':
                        return <h4 key={index} style={textStyle} className={`text-xl font-semibold !mb-2 !mt-4 ${alignClass}`}>{item.content}</h4>;
                    case 'paragraph':
                        return <p key={index} style={textStyle} className={alignClass}>{item.content}</p>;
                    case 'image':
                        return (
                            <figure key={index} className="my-4">
                                <SafeImage src={item.content as string} alt={item.alt || 'Imagem do módulo'} className="rounded-lg shadow-md max-h-96 mx-auto" />
                                {item.alt && (
                                    <figcaption className="text-center text-sm mt-2 text-slate-600 dark:text-slate-300 hc-text-secondary">
                                        {item.alt}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    case 'list':
                        return (
                            <ul key={index} className="list-disc pl-5">
                                {(item.content as string[]).map((li, i) => <li key={i} style={textStyle}>{li}</li>)}
                            </ul>
                        );
                    case 'quote':
                        return <blockquote key={index} className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-4"><p style={textStyle}>{item.content}</p></blockquote>;
                    case 'video':
                        const videoUrl = item.content as string;
                        const videoId = getYouTubeVideoId(videoUrl);
                        const isOffline = !isOnline;
                        
                        if (isOffline) {
                             return (
                                <div key={index} className="my-6 aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center p-4 text-center border border-slate-200 dark:border-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" /></svg>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Vídeo indisponível offline</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Conecte-se à internet para assistir este conteúdo.</p>
                                </div>
                            )
                        }

                        return videoId ? (
                            <div key={index} className="my-6 aspect-video">
                            <iframe 
                                    className="w-full h-full rounded-lg shadow-md"
                                    src={`https://www.youtube.com/embed/${videoId}`} 
                                    title="YouTube video player" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                ></iframe>
                            </div>
                        ) : <p key={index} className="text-red-500 my-4">Link do vídeo do YouTube inválido ou não suportado: {videoUrl}</p>;
                    case 'divider':
                        return <hr key={index} className="my-8 dark:border-slate-700" />;
                    default:
                        return null;
                }
            })}
        </div>
    );
});
