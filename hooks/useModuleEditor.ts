
import { useReducer, useCallback } from 'react';
import type { ModulePage, ModulePageContent, ModulePageContentType } from '../types';

type Action =
    | { type: 'SET_PAGES'; payload: ModulePage[] }
    | { type: 'ADD_PAGE' }
    | { type: 'REMOVE_PAGE'; payload: number }
    | { type: 'UPDATE_PAGE_TITLE'; payload: { pageId: number; title: string } }
    | { type: 'ADD_BLOCK'; payload: { pageId: number; contentType: ModulePageContentType } }
    | { type: 'REMOVE_BLOCK'; payload: { pageId: number; blockIndex: number } }
    | { type: 'UPDATE_BLOCK'; payload: { pageId: number; blockIndex: number; data: Partial<ModulePageContent> } }
    | { type: 'MOVE_BLOCK'; payload: { pageId: number; blockIndex: number; direction: 'up' | 'down' } };

function moduleReducer(state: ModulePage[], action: Action): ModulePage[] {
    switch (action.type) {
        case 'SET_PAGES':
            return action.payload;
        case 'ADD_PAGE':
            return [...state, { id: Date.now(), title: `Página ${state.length + 1}`, content: [] }];
        case 'REMOVE_PAGE':
            if (state.length <= 1) return state;
            return state.filter(p => p.id !== action.payload).map((p, i) => ({ ...p, title: `Página ${i + 1}` }));
        case 'UPDATE_PAGE_TITLE':
            return state.map(p => p.id === action.payload.pageId ? { ...p, title: action.payload.title } : p);
        case 'ADD_BLOCK': {
            const { pageId, contentType } = action.payload;
            const newBlock: ModulePageContent = contentType === 'list'
                ? { type: contentType, content: ['Novo item'] }
                : contentType === 'divider'
                    ? { type: contentType, content: '' }
                    : contentType === 'image'
                        ? { type: contentType, content: '', alt: '' }
                        : contentType === 'video'
                            ? { type: contentType, content: '' }
                            : { type: contentType, content: '', align: 'left' };

            return state.map(p => p.id === pageId ? { ...p, content: [...p.content, newBlock] } : p);
        }
        case 'REMOVE_BLOCK':
            return state.map(p => p.id === action.payload.pageId ? { ...p, content: p.content.filter((_, i) => i !== action.payload.blockIndex) } : p);
        case 'UPDATE_BLOCK':
            return state.map(p => {
                if (p.id === action.payload.pageId) {
                    const newContent = [...p.content];
                    newContent[action.payload.blockIndex] = { ...newContent[action.payload.blockIndex], ...action.payload.data };
                    return { ...p, content: newContent };
                }
                return p;
            });
        case 'MOVE_BLOCK':
            return state.map(p => {
                if (p.id === action.payload.pageId) {
                    const { blockIndex, direction } = action.payload;
                    const newContent = [...p.content];
                    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
                    if (targetIndex >= 0 && targetIndex < newContent.length) {
                        [newContent[blockIndex], newContent[targetIndex]] = [newContent[targetIndex], newContent[blockIndex]];
                    }
                    return { ...p, content: newContent };
                }
                return p;
            });
        default:
            return state;
    }
}

export function useModuleEditor(initialPages: ModulePage[]) {
    const [pages, dispatch] = useReducer(moduleReducer, initialPages);

    const setPages = useCallback((newPages: ModulePage[]) => dispatch({ type: 'SET_PAGES', payload: newPages }), []);
    const addPage = useCallback(() => dispatch({ type: 'ADD_PAGE' }), []);
    const removePage = useCallback((pageId: number) => dispatch({ type: 'REMOVE_PAGE', payload: pageId }), []);
    const updatePageTitle = useCallback((pageId: number, title: string) => dispatch({ type: 'UPDATE_PAGE_TITLE', payload: { pageId, title } }), []);
    
    const addBlock = useCallback((pageId: number, contentType: ModulePageContentType) => 
        dispatch({ type: 'ADD_BLOCK', payload: { pageId, contentType } }), []);
    
    const removeBlock = useCallback((pageId: number, blockIndex: number) => 
        dispatch({ type: 'REMOVE_BLOCK', payload: { pageId, blockIndex } }), []);
        
    const updateBlock = useCallback((pageId: number, blockIndex: number, data: Partial<ModulePageContent>) => 
        dispatch({ type: 'UPDATE_BLOCK', payload: { pageId, blockIndex, data } }), []);
        
    const moveBlock = useCallback((pageId: number, blockIndex: number, direction: 'up' | 'down') => 
        dispatch({ type: 'MOVE_BLOCK', payload: { pageId, blockIndex, direction } }), []);

    return {
        pages,
        setPages,
        addPage,
        removePage,
        updatePageTitle,
        addBlock,
        removeBlock,
        updateBlock,
        moveBlock
    };
}
