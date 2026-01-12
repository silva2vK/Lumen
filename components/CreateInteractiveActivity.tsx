
import React, { useState, useEffect } from 'react';
import { useTeacherAcademicContext } from '../contexts/TeacherAcademicContext';
import { useTeacherClassContext } from '../contexts/TeacherClassContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Card } from './common/Card';
import { ICONS, SpinnerIcon, SUBJECTS_LIST } from '../constants/index';
import { InputField, SelectField } from './common/FormHelpers';
import type { Activity, Unidade, HotspotItem, ConnectionPair, TreeData, DraggableColumnItem } from '../types';
import { supabase } from './supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { compressImage } from '../utils/imageCompression';

type InteractiveType = 'VisualSourceAnalysis' | 'ConceptConnection' | 'AdvanceOrganizer' | 'ProgressiveTree' | 'IntegrativeDragDrop';

const CreateInteractiveActivity: React.FC = () => {
    const { handleSaveActivity, handleUpdateActivity, isSubmittingContent } = useTeacherAcademicContext();
    const { teacherClasses } = useTeacherClassContext();
    const { editingActivity, exitEditingActivity } = useNavigation();
    const { user } = useAuth();
    const { addToast } = useToast();

    // Basic Meta
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState(10);
    const [materia, setMateria] = useState<string>(SUBJECTS_LIST[0]);
    const [unidade, setUnidade] = useState<Unidade>('1ª Unidade');
    const [classId, setClassId] = useState('');
    const [dueDate, setDueDate] = useState('');
    
    // Type Selection
    const [selectedType, setSelectedType] = useState<InteractiveType>('VisualSourceAnalysis');

    // Specific Data States
    // Visual Analysis
    const [visualImageUrl, setVisualImageUrl] = useState('');
    const [isUploadingAsset, setIsUploadingAsset] = useState(false);
    const [hotspots, setHotspots] = useState<HotspotItem[]>([]);
    
    // Concept Connection
    const [leftItems, setLeftItems] = useState<{id: string, text: string}[]>([]);
    const [rightItems, setRightItems] = useState<{id: string, text: string}[]>([]);
    const [pairs, setPairs] = useState<ConnectionPair[]>([]);

    // Advance Organizer
    const [organizerMedia, setOrganizerMedia] = useState('');
    const [organizerAnalogy, setOrganizerAnalogy] = useState('');
    const [organizerConcept, setOrganizerConcept] = useState('');
    const [organizerLinkedModule, setOrganizerLinkedModule] = useState('');

    // Progressive Tree
    const [treeRoot, setTreeRoot] = useState<TreeData>({ id: 'root', label: 'Conceito Central', content: '', children: [] });

    // Integrative Drag Drop
    const [colA, setColA] = useState('Coluna A');
    const [colB, setColB] = useState('Coluna B');
    const [dragItems, setDragItems] = useState<DraggableColumnItem[]>([]);

    // Init Edit
    useEffect(() => {
        if (editingActivity) {
            setTitle(editingActivity.title);
            setDescription(editingActivity.description);
            setPoints(editingActivity.points);
            setMateria(editingActivity.materia || SUBJECTS_LIST[0]);
            setUnidade(editingActivity.unidade as Unidade || '1ª Unidade');
            setClassId(editingActivity.classId || '');
            setDueDate(editingActivity.dueDate || '');
            
            if (editingActivity.type && ['VisualSourceAnalysis', 'ConceptConnection', 'AdvanceOrganizer', 'ProgressiveTree', 'IntegrativeDragDrop'].includes(editingActivity.type)) {
                setSelectedType(editingActivity.type as InteractiveType);
                
                if (editingActivity.visualSourceData) {
                    setVisualImageUrl(editingActivity.visualSourceData.imageUrl);
                    setHotspots(editingActivity.visualSourceData.hotspots);
                }
                if (editingActivity.conceptConnectionData) {
                    setLeftItems(editingActivity.conceptConnectionData.leftColumn);
                    setRightItems(editingActivity.conceptConnectionData.rightColumn);
                    setPairs(editingActivity.conceptConnectionData.pairs);
                }
                if (editingActivity.advanceOrganizerData) {
                    setOrganizerMedia(editingActivity.advanceOrganizerData.mediaUrl || '');
                    setOrganizerAnalogy(editingActivity.advanceOrganizerData.analogyText);
                    setOrganizerConcept(editingActivity.advanceOrganizerData.targetConcept);
                    setOrganizerLinkedModule(editingActivity.advanceOrganizerData.linkedModuleId || '');
                }
                if (editingActivity.progressiveTreeData) {
                    setTreeRoot(editingActivity.progressiveTreeData.root);
                }
                if (editingActivity.integrativeData) {
                    setColA(editingActivity.integrativeData.columnA);
                    setColB(editingActivity.integrativeData.columnB);
                    setDragItems(editingActivity.integrativeData.items);
                }
            }
        }
    }, [editingActivity]);

    // Handlers for specific types
    const addHotspot = () => setHotspots([...hotspots, { id: Date.now().toString(), x: 50, y: 50, label: 'Novo Ponto', feedback: '' }]);
    const updateHotspot = (idx: number, data: Partial<HotspotItem>) => setHotspots(prev => prev.map((h, i) => i === idx ? { ...h, ...data } : h));
    const removeHotspot = (idx: number) => setHotspots(prev => prev.filter((_, i) => i !== idx));

    const addDragItem = () => setDragItems([...dragItems, { id: Date.now().toString(), content: 'Novo Item', correctColumnId: 'A' }]);
    const updateDragItem = (idx: number, data: Partial<DraggableColumnItem>) => setDragItems(prev => prev.map((it, i) => i === idx ? { ...it, ...data } : it));
    const removeDragItem = (idx: number) => setDragItems(prev => prev.filter((_, i) => i !== idx));

    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !user) return;
        
        setIsUploadingAsset(true);
        try {
            let file = e.target.files[0];
            const isPdf = file.type === 'application/pdf';
            const isImage = file.type.startsWith('image/');

            // Validation Logic
            if (isImage) {
                // Image Limit: 7MB (checked inside compressImage too, but good to check here)
                if (file.size > 7 * 1024 * 1024) {
                    throw new Error("Imagem muito grande. O limite é 7MB.");
                }
                // Compress Image
                file = await compressImage(file);
            } else if (isPdf) {
                // PDF Limit: 15MB
                if (file.size > 15 * 1024 * 1024) {
                    throw new Error("PDF muito grande. O limite é 15MB.");
                }
                // No compression for PDF
            } else {
                throw new Error("Formato não suportado. Use Imagem ou PDF.");
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `asset_${user.id}_${Date.now()}.${fileExt}`;
            
            // Upload to Supabase Storage (Bucket 'activity_assets')
            const { error: uploadError } = await supabase.storage
                .from('activity_assets')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('activity_assets')
                .getPublicUrl(fileName);

            setVisualImageUrl(data.publicUrl);
            addToast(isPdf ? "PDF carregado com sucesso!" : "Imagem otimizada e carregada!", "success");

        } catch (error: any) {
            console.error("Upload Asset Error:", error);
            addToast(error.message, "error");
        } finally {
            setIsUploadingAsset(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleSave = async (isDraft: boolean) => {
        if (!title.trim()) { alert("Título é obrigatório"); return; }

        const activityData: any = {
            title, description, points, materia, unidade, classId: classId || null, dueDate,
            type: selectedType
        };

        if (classId) {
            const cls = teacherClasses.find(c => c.id === classId);
            if (cls) activityData.className = cls.name;
        }

        // Attach specific data
        switch (selectedType) {
            case 'VisualSourceAnalysis':
                activityData.visualSourceData = { imageUrl: visualImageUrl, hotspots };
                break;
            case 'ConceptConnection':
                activityData.conceptConnectionData = { leftColumn: leftItems, rightColumn: rightItems, pairs };
                break;
            case 'AdvanceOrganizer':
                activityData.advanceOrganizerData = { mediaUrl: organizerMedia, analogyText: organizerAnalogy, targetConcept: organizerConcept, linkedModuleId: organizerLinkedModule };
                break;
            case 'ProgressiveTree':
                activityData.progressiveTreeData = { root: treeRoot };
                break;
            case 'IntegrativeDragDrop':
                activityData.integrativeData = { columnA: colA, columnB: colB, items: dragItems };
                break;
        }

        let success = false;
        if (editingActivity) {
            success = await handleUpdateActivity(editingActivity.id, activityData, isDraft);
        } else {
            success = await handleSaveActivity(activityData, isDraft);
        }

        if (success) exitEditingActivity();
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h1 className="text-2xl font-bold text-white">Laboratório Interativo (Ausubel)</h1>
                <button onClick={exitEditingActivity} className="text-sm text-slate-400 hover:text-white">Cancelar</button>
            </div>

            <Card>
                <div className="space-y-4">
                    <InputField label="Tipo de Dinâmica" required>
                        <SelectField value={selectedType} onChange={e => setSelectedType(e.target.value as InteractiveType)}>
                            <option value="VisualSourceAnalysis">Análise de Fonte Visual (Hotspots)</option>
                            <option value="IntegrativeDragDrop">Reconciliação Integrativa (Drag & Drop)</option>
                            <option value="AdvanceOrganizer">Organizador Prévio (Ponte Cognitiva)</option>
                            <option value="ConceptConnection">Conexão de Conceitos (Em Breve)</option>
                            <option value="ProgressiveTree">Árvore Progressiva (Em Breve)</option>
                        </SelectField>
                    </InputField>

                    <InputField label="Título" required>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" />
                    </InputField>
                    <InputField label="Descrição / Instruções">
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" />
                    </InputField>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField label="Matéria">
                            <SelectField value={materia} onChange={e => setMateria(e.target.value)}>{SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}</SelectField>
                        </InputField>
                        <InputField label="Pontos">
                            <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" />
                        </InputField>
                        <InputField label="Turma (Opcional)">
                            <SelectField value={classId} onChange={e => setClassId(e.target.value)}>
                                <option value="">Apenas Repositório</option>
                                {teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </SelectField>
                        </InputField>
                    </div>
                </div>
            </Card>

            {/* --- DYNAMIC FORM AREA --- */}
            
            {selectedType === 'VisualSourceAnalysis' && (
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Configuração de Fonte Visual</h3>
                    <div className="space-y-4">
                        
                        {/* URL INPUT OR UPLOAD */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">Fonte (Imagem ou PDF)</label>
                            
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex-1 w-full">
                                    <input 
                                        type="text" 
                                        value={visualImageUrl} 
                                        onChange={e => setVisualImageUrl(e.target.value)} 
                                        className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" 
                                        placeholder="Cole a URL ou faça upload ao lado..." 
                                    />
                                </div>
                                <div className="relative">
                                    <label className={`cursor-pointer px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase rounded hover:bg-slate-700 border border-slate-600 transition-colors flex items-center gap-2 ${isUploadingAsset ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {isUploadingAsset ? <SpinnerIcon className="h-4 w-4" /> : <span>📁 Upload</span>}
                                        <input 
                                            type="file" 
                                            accept="image/*,application/pdf" 
                                            className="hidden" 
                                            onChange={handleAssetUpload}
                                            disabled={isUploadingAsset}
                                        />
                                    </label>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                Suporta: Imagens (Max 7MB, comprimidas auto.) e PDFs (Max 15MB).
                            </p>
                        </div>
                        
                        <div className="border border-slate-700 rounded p-4 bg-[#0d1117]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-400">Pontos de Interesse ({hotspots.length})</span>
                                <button onClick={addHotspot} className="text-xs bg-brand text-black px-2 py-1 rounded font-bold">+ Adicionar</button>
                            </div>
                            {visualImageUrl.toLowerCase().includes('.pdf') && (
                                <p className="text-xs text-yellow-500 mb-2">
                                    ⚠️ Nota: Hotspots funcionam melhor em imagens. Em PDFs, os alunos visualizarão o arquivo inteiro.
                                </p>
                            )}
                            {hotspots.map((h, i) => (
                                <div key={i} className="flex gap-2 mb-2 items-center flex-wrap md:flex-nowrap">
                                    <input type="number" value={h.x} onChange={e => updateHotspot(i, { x: Number(e.target.value) })} className="w-14 p-1 bg-black border border-slate-700 text-white text-xs" placeholder="X%" />
                                    <input type="number" value={h.y} onChange={e => updateHotspot(i, { y: Number(e.target.value) })} className="w-14 p-1 bg-black border border-slate-700 text-white text-xs" placeholder="Y%" />
                                    <input type="text" value={h.label} onChange={e => updateHotspot(i, { label: e.target.value })} className="flex-1 p-1 bg-black border border-slate-700 text-white text-xs min-w-[100px]" placeholder="Rótulo" />
                                    <input type="text" value={h.feedback} onChange={e => updateHotspot(i, { feedback: e.target.value })} className="flex-1 p-1 bg-black border border-slate-700 text-white text-xs min-w-[100px]" placeholder="Explicação" />
                                    <button onClick={() => removeHotspot(i)} className="text-red-500 font-bold px-2">×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {selectedType === 'IntegrativeDragDrop' && (
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Configuração de Classificação</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Nome Coluna A">
                                <input type="text" value={colA} onChange={e => setColA(e.target.value)} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" />
                            </InputField>
                            <InputField label="Nome Coluna B">
                                <input type="text" value={colB} onChange={e => setColB(e.target.value)} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" />
                            </InputField>
                        </div>

                        <div className="border border-slate-700 rounded p-4 bg-[#0d1117]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-400">Itens ({dragItems.length})</span>
                                <button onClick={addDragItem} className="text-xs bg-brand text-black px-2 py-1 rounded font-bold">+ Adicionar Item</button>
                            </div>
                            {dragItems.map((item, i) => (
                                <div key={i} className="flex gap-2 mb-2 items-center">
                                    <input type="text" value={item.content} onChange={e => updateDragItem(i, { content: e.target.value })} className="flex-1 p-1 bg-black border border-slate-700 text-white text-xs" placeholder="Conteúdo do Item" />
                                    <select value={item.correctColumnId} onChange={e => updateDragItem(i, { correctColumnId: e.target.value })} className="p-1 bg-black border border-slate-700 text-white text-xs">
                                        <option value="A">Coluna A</option>
                                        <option value="B">Coluna B</option>
                                        <option value="Intersection">Interseção (Ambos)</option>
                                    </select>
                                    <button onClick={() => removeDragItem(i)} className="text-red-500">×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {selectedType === 'AdvanceOrganizer' && (
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Configuração do Organizador Prévio</h3>
                    <div className="space-y-4">
                        <InputField label="Texto da Analogia / Ponte">
                            <textarea value={organizerAnalogy} onChange={e => setOrganizerAnalogy(e.target.value)} rows={4} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" placeholder="Explique o novo conceito usando algo familiar..." />
                        </InputField>
                        <InputField label="Conceito Alvo (Novo Aprendizado)">
                            <input type="text" value={organizerConcept} onChange={e => setOrganizerConcept(e.target.value)} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" />
                        </InputField>
                        <InputField label="URL de Vídeo/Mídia (Opcional)">
                            <input type="text" value={organizerMedia} onChange={e => setOrganizerMedia(e.target.value)} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" placeholder="YouTube URL..." />
                        </InputField>
                    </div>
                </Card>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button onClick={() => handleSave(true)} disabled={isSubmittingContent} className="px-6 py-3 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50">Salvar Rascunho</button>
                <button onClick={() => handleSave(false)} disabled={isSubmittingContent} className="px-6 py-3 bg-brand text-black font-bold rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center gap-2">
                    {isSubmittingContent ? <SpinnerIcon className="h-5 w-5 text-black" /> : null}
                    Publicar
                </button>
            </div>
        </div>
    );
};

export default CreateInteractiveActivity;
