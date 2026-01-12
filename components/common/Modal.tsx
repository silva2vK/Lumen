
import React, { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'default' | 'full' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'default' }) => {
    
    // Mapeamento de tamanhos para classes responsivas do Tailwind
    const getSizeClasses = () => {
        switch (size) {
            case 'full':
                return 'h-screen w-screen rounded-none';
            case 'xl':
                return 'w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl';
            case 'lg':
                return 'w-full max-w-md sm:max-w-xl md:max-w-3xl';
            case 'default':
            default:
                // Default agora cresce em tablets (md) ao invés de travar em max-w-lg
                return 'w-full max-w-md sm:max-w-lg md:max-w-2xl'; 
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className={`flex min-h-full items-center justify-center p-4 text-center ${size === 'full' ? 'p-0' : ''}`}>
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel 
                                className={`glass-modal transform overflow-hidden rounded-2xl text-left align-middle transition-all flex flex-col ${getSizeClasses()} ${size === 'full' ? '' : 'max-h-[90vh]'}`}
                            >
                                <div className="flex justify-between items-center border-b border-white/10 p-4 sm:px-6 flex-shrink-0">
                                    <DialogTitle as="h3" className="text-lg font-bold leading-6 text-slate-100">
                                        {title}
                                    </DialogTitle>
                                    <button
                                        type="button"
                                        className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                        onClick={onClose}
                                        aria-label="Fechar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={`p-4 sm:p-6 overflow-y-auto ${size === 'full' ? 'flex-1' : ''} text-slate-300`}>
                                    {children}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
