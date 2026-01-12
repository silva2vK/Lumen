
import React, { useState, useEffect } from 'react';
import { useTeacherAcademicContext } from '../contexts/TeacherAcademicContext';
import { useTeacherClassContext } from '../contexts/TeacherClassContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Card } from './common/Card';
import { ICONS, SpinnerIcon, SUBJECTS_LIST } from '../constants/index';
import type { ActivityItem, Activity, Unidade } from '../types';
import { InputField, SelectField } from './common/FormHelpers';

const CreateActivity: React.FC = () => {
    const { handleSaveActivity, handleUpdateActivity, isSubmittingContent } = useTeacherAcademicContext();
    const { teacherClasses } = useTeacherClassContext();
    const { editingActivity, exitEditingActivity } = useNavigation();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [points, setPoints] = useState(10);
    const [materia, setMateria] = useState<string>(SUBJECTS_LIST[0]);
    const [unidade, setUnidade] = useState<Unidade>('1ª Unidade');
    const [classId, setClassId] = useState('');
    const [items, setItems] = useState<ActivityItem[]>([]);
    const [allowFileUpload, setAllowFileUpload] = useState(false);

    // Initial Load
    useEffect(() => {
        if (editingActivity) {
            setTitle(editingActivity.title);
            setDescription(editingActivity.description);
            setDueDate(editingActivity.dueDate || '');
            setPoints(editingActivity.points);
            setMateria(editingActivity.materia || SUBJECTS_LIST[0]);
            setUnidade(editingActivity.unidade as Unidade || '1ª Unidade');
            setClassId(editingActivity.classId || '');
            setAllowFileUpload(editingActivity.allowFileUpload || false);
            
            if (editingActivity.items) setItems(editingActivity.items);
            else if (editingActivity.questions) {
                // Convert legacy questions
                setItems(editingActivity.questions.map((q: any) => ({
                    id: q.id.toString(), type: 'multiple_choice', question: q.question, options: q.choices, points: 1
                } as ActivityItem)));
            }
        }
    }, [editingActivity]);

    const handleAddItem = (type: 'text' | 'multiple_choice') => {
        setItems(prev => [...prev, {
            id: Date.now().toString(),
            type,
            question: '',
            points: 1,
            options: type === 'multiple_choice' ? [{ id: '1', text: '' }, { id: '2', text: '' }] : undefined,
            correctOptionId: type === 'multiple_choice' ? '1' : undefined
        }]);
    };

    const updateItem = (index: number, updates: Partial<ActivityItem>) => {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateOption = (itemIndex: number, optionIndex: number, text: string) => {
        const newItems = [...items];
        if (newItems[itemIndex].options) {
            newItems[itemIndex].options![optionIndex].text = text;
            setItems(newItems);
        }
    };

    const handleSave = async (isDraft: boolean) => {
        if (!title.trim()) { alert("Título é obrigatório"); return; }
        
        const activityData: any = {
            title, description, dueDate, points, materia, unidade, classId: classId || null,
            items, allowFileUpload, type: allowFileUpload ? 'Envio de Arquivo' : (items.some(i => i.type === 'text') ? 'Tarefa (Texto)' : 'Múltipla Escolha')
        };

        if (classId) {
            const cls = teacherClasses.find(c => c.id === classId);
            if (cls) activityData.className = cls.name;
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
                <h1 className="text-2xl font-bold text-white">{editingActivity ? 'Editar Atividade' : 'Nova Atividade'}</h1>
                <button onClick={exitEditingActivity} className="text-sm text-slate-400 hover:text-white">Cancelar</button>
            </div>

            <Card>
                <div className="space-y-4">
                    <InputField label="Título da Atividade" required>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white focus:border-brand outline-none" />
                    </InputField>
                    <InputField label="Instruções">
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white focus:border-brand outline-none" />
                    </InputField>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Turma (Opcional)">
                            <SelectField value={classId} onChange={e => setClassId(e.target.value)}>
                                <option value="">Salvar apenas no repositório</option>
                                {teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </SelectField>
                        </InputField>
                        <InputField label="Data de Entrega">
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" />
                        </InputField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField label="Matéria">
                            <SelectField value={materia} onChange={e => setMateria(e.target.value)}>
                                {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                            </SelectField>
                        </InputField>
                        <InputField label="Unidade">
                            <SelectField value={unidade} onChange={e => setUnidade(e.target.value as Unidade)}>
                                <option value="1ª Unidade">1ª Unidade</option>
                                <option value="2ª Unidade">2ª Unidade</option>
                                <option value="3ª Unidade">3ª Unidade</option>
                                <option value="4ª Unidade">4ª Unidade</option>
                            </SelectField>
                        </InputField>
                        <InputField label="Pontos Totais">
                            <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white" />
                        </InputField>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" checked={allowFileUpload} onChange={e => setAllowFileUpload(e.target.checked)} className="rounded border-slate-600 bg-[#0d1117] text-brand focus:ring-brand" />
                        <span className="text-sm text-slate-300">Permitir envio de arquivo (PDF, Imagem)</span>
                    </div>
                </div>
            </Card>

            {/* Questions Builder */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Questões</h2>
                    <div className="flex gap-2">
                        <button onClick={() => handleAddItem('text')} className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-700">+ Dissertativa</button>
                        <button onClick={() => handleAddItem('multiple_choice')} className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-700">+ Múltipla Escolha</button>
                    </div>
                </div>

                {items.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-slate-500">Nenhuma questão adicionada.</p>
                    </div>
                )}

                {items.map((item, index) => (
                    <Card key={item.id} className="relative">
                        <button onClick={() => removeItem(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-400">✕</button>
                        <div className="space-y-3 pr-8">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 uppercase font-bold">Enunciado</label>
                                    <input 
                                        type="text" 
                                        value={item.question} 
                                        onChange={e => updateItem(index, { question: e.target.value })} 
                                        className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white mt-1" 
                                        placeholder="Digite a pergunta..."
                                    />
                                </div>
                                <div className="w-20">
                                    <label className="text-xs text-slate-500 uppercase font-bold">Pts</label>
                                    <input 
                                        type="number" 
                                        value={item.points} 
                                        onChange={e => updateItem(index, { points: Number(e.target.value) })} 
                                        className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded text-white mt-1" 
                                    />
                                </div>
                            </div>

                            {item.type === 'multiple_choice' && item.options && (
                                <div className="space-y-2 pl-4 border-l-2 border-slate-700">
                                    {item.options.map((opt, optIdx) => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <input 
                                                type="radio" 
                                                name={`correct-${item.id}`} 
                                                checked={item.correctOptionId === opt.id} 
                                                onChange={() => updateItem(index, { correctOptionId: opt.id })}
                                                className="bg-[#0d1117] border-slate-600 text-brand focus:ring-brand"
                                            />
                                            <input 
                                                type="text" 
                                                value={opt.text} 
                                                onChange={e => updateOption(index, optIdx, e.target.value)} 
                                                className="flex-1 p-1 bg-[#0d1117] border border-slate-700 rounded text-white text-sm" 
                                                placeholder={`Opção ${optIdx + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button 
                    onClick={() => handleSave(true)} 
                    disabled={isSubmittingContent}
                    className="px-6 py-3 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50"
                >
                    Salvar Rascunho
                </button>
                <button 
                    onClick={() => handleSave(false)} 
                    disabled={isSubmittingContent}
                    className="px-6 py-3 bg-brand text-black font-bold rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center gap-2"
                >
                    {isSubmittingContent ? <SpinnerIcon className="h-5 w-5 text-black" /> : null}
                    Publicar
                </button>
            </div>
        </div>
    );
};

export default CreateActivity;
