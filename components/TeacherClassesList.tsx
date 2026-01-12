
import React, { useState } from 'react';
import { useTeacherClassContext } from '../contexts/TeacherClassContext';
import { useTeacherCommunicationContext } from '../contexts/TeacherCommunicationContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import { ICONS, SpinnerIcon } from '../constants/index';
import type { TeacherClass, ClassNotice } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from './supabaseClient'; // Usando Supabase

// --- Sub-components ---

const NoticeHistoryModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    className: string;
    notices: ClassNotice[];
}> = ({ isOpen, onClose, className, notices }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Mural de Avisos: ${className}`}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                {notices && notices.length > 0 ? (
                    <div className="relative border-l-2 border-slate-700 ml-3 space-y-6">
                        {notices.map((notice, index) => (
                            <div key={index} className="ml-6 relative">
                                <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-slate-700 bg-[#0d1117] flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{notice.text}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                            {new Date(notice.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-[10px] text-brand font-bold">
                                            {notice.author}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 opacity-50">
                        <div className="mb-2 text-4xl">📭</div>
                        <p className="text-sm">Nenhum aviso registrado.</p>
                    </div>
                )}
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-colors">
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

const CreateClassModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreate: (name: string, coverImageUrl?: string) => Promise<any> }> = ({ isOpen, onClose, onCreate }) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    
    // Image Handling State
    const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCoverImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        
        let finalImageUrl = undefined;

        // Lógica de Upload (Supabase 'covers')
        if (imageMode === 'upload' && coverImageFile && user) {
            try {
                const file = coverImageFile;
                const fileExt = file.name.split('.').pop();
                const fileName = `class_${user.id}_${Date.now()}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('covers')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('covers')
                    .getPublicUrl(fileName);

                finalImageUrl = data.publicUrl;
            } catch (error) {
                console.error("Erro ao fazer upload da imagem:", error);
            }
        } 
        // Lógica de URL Direta
        else if (imageMode === 'url' && coverImageUrl.trim()) {
            finalImageUrl = coverImageUrl.trim();
        }

        await onCreate(name, finalImageUrl);
        
        // Reset State
        setIsSubmitting(false);
        setName('');
        setCoverImageFile(null);
        setCoverImageUrl('');
        setImageMode('upload');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Inicializar Nova Turma">
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Nome da Turma <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: História - 8º Ano A - 2024"
                        className="w-full p-3 bg-[#0d1117] border border-slate-700 rounded-lg text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-600"
                        autoFocus
                    />
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Capa da Turma (Opcional)</label>
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setImageMode('upload')}
                                className={`text-[10px] font-bold uppercase transition-colors ${imageMode === 'upload' ? 'text-brand underline underline-offset-4' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                Upload
                            </button>
                            <button 
                                type="button"
                                onClick={() => setImageMode('url')}
                                className={`text-[10px] font-bold uppercase transition-colors ${imageMode === 'url' ? 'text-brand underline underline-offset-4' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                Link (URL)
                            </button>
                        </div>
                    </div>

                    {imageMode === 'upload' ? (
                        <div className="relative">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-slate-700 file:text-white
                                hover:file:bg-slate-600
                                cursor-pointer"
                            />
                            {coverImageFile && <p className="text-xs text-brand mt-1 ml-2">Arquivo: {coverImageFile.name}</p>}
                        </div>
                    ) : (
                        <input 
                            type="text" 
                            value={coverImageUrl}
                            onChange={e => setCoverImageUrl(e.target.value)}
                            placeholder="Cole a URL da imagem aqui (https://...)"
                            className="w-full p-3 bg-[#0d1117] border border-slate-700 rounded-lg text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-600 text-sm"
                        />
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">Cancelar</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!name.trim() || isSubmitting}
                        className="px-6 py-2 text-sm bg-brand text-black font-bold rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center shadow-[0_0_15px_rgba(var(--brand-rgb),0.3)]"
                    >
                        {isSubmitting ? <SpinnerIcon className="h-4 w-4 mr-2 text-black" /> : null}
                        {isSubmitting ? 'Criando...' : 'Criar Turma'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const PostNoticeModal: React.FC<{ isOpen: boolean; onClose: () => void; onPost: (text: string) => Promise<void>; className: string }> = ({ isOpen, onClose, onPost, className }) => {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        setIsSubmitting(true);
        await onPost(text);
        setIsSubmitting(false);
        setText('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Novo Aviso: ${className}`}>
            <div className="space-y-4">
                <textarea 
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={5}
                    placeholder="Digite a mensagem para os alunos..."
                    className="w-full p-3 bg-[#0d1117] border border-slate-700 rounded-lg text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none placeholder:text-slate-600"
                    autoFocus
                />
                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">Cancelar</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!text.trim() || isSubmitting}
                        className="px-6 py-2 text-sm bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50 flex items-center shadow-lg"
                    >
                        {isSubmitting ? <SpinnerIcon className="h-4 w-4 mr-2" /> : null}
                        Enviar Broadcast
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const ClassCard: React.FC<{ 
    classData: TeacherClass; 
    onOpen: () => void;
    onPostNotice: () => void;
    onViewHistory: () => void;
}> = ({ classData, onOpen, onPostNotice, onViewHistory }) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyCode = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(classData.code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const hasNotices = classData.notices && classData.notices.length > 0;
    const lastNotice = hasNotices ? classData.notices![0] : null;

    return (
        <div className="group relative bg-[#0d1117] rounded-2xl border border-white/10 overflow-hidden hover:border-brand/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            
            {/* Background Image Layer */}
            {classData.coverImageUrl && (
                <>
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={classData.coverImageUrl} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
                            alt="Capa da Turma"
                        />
                    </div>
                    {/* Overlay para contraste do texto */}
                    <div className="absolute inset-0 bg-black/80 z-0" />
                </>
            )}

            {/* Header com Gradiente Sutil (z-10 para ficar acima da imagem) */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50 group-hover:opacity-100 transition-opacity z-10" />
            
            <div className="p-6 flex-grow relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 group-hover:text-brand transition-colors truncate max-w-[200px]" title={classData.name}>{classData.name}</h3>
                        <button 
                            onClick={copyCode}
                            className="group/code flex items-center gap-2 mt-2 px-3 py-1 bg-black/40 border border-white/10 rounded-md hover:border-white/30 transition-all"
                            title="Copiar Código de Acesso"
                        >
                            <span className="font-mono text-xs font-bold text-slate-400 group-hover/code:text-white tracking-widest">{classData.code}</span>
                            {isCopied ? (
                                <span className="text-green-400 text-[10px] font-bold animate-fade-in">COPIADO</span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-500 group-hover/code:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            )}
                        </button>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl text-slate-400 border border-white/5 group-hover:text-white group-hover:bg-white/10 transition-colors">
                        {ICONS.teacher_dashboard}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-lg border border-white/5 backdrop-blur-sm">
                        <span className="text-2xl font-bold text-white">{classData.studentCount || (classData.students?.length || 0)}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alunos</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-lg border border-white/5 backdrop-blur-sm">
                        <span className="text-2xl font-bold text-white">{classData.activityCount || 0}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Atividades</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onPostNotice}
                        className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 font-semibold rounded-lg text-sm transition-all backdrop-blur-sm"
                    >
                        Avisar
                    </button>
                    <button 
                        onClick={onOpen}
                        className="py-2 px-4 bg-brand text-black font-bold rounded-lg hover:bg-brand/90 text-sm transition-all shadow-[0_0_15px_rgba(var(--brand-rgb),0.1)] hover:shadow-[0_0_15px_rgba(var(--brand-rgb),0.3)] flex items-center justify-center gap-2"
                    >
                        <span>Gerenciar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>
            
            {/* Notice Footer (Clickable History) - Relative z-10 ensures it's above image */}
            <button 
                onClick={onViewHistory}
                className="relative z-10 border-t border-white/5 bg-black/40 p-4 hover:bg-white/5 transition-colors text-left w-full group/footer backdrop-blur-md"
            >
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover/footer:text-brand transition-colors">
                        {hasNotices ? 'Último Aviso' : 'Mural de Avisos'}
                    </p>
                    <span className="text-[10px] text-slate-600 group-hover/footer:text-slate-400 flex items-center gap-1">
                        Histórico <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </span>
                </div>
                {hasNotices ? (
                    <div className="text-xs text-slate-400 line-clamp-1 italic font-medium">
                        "{lastNotice?.text}"
                    </div>
                ) : (
                    <div className="text-xs text-slate-600 italic">
                        Nenhum aviso postado. Clique para ver histórico vazio.
                    </div>
                )}
            </button>
        </div>
    );
};

const TeacherClassesList: React.FC = () => {
    // Context hooks
    const classContext = useTeacherClassContext();
    const commContext = useTeacherCommunicationContext();
    const navContext = useNavigation();

    // Safely destructure context values (with fallback if context is initially undefined/loading)
    const teacherClasses = classContext?.teacherClasses || [];
    const handleCreateClass = classContext?.handleCreateClass || (async () => ({ success: false }));
    const isLoadingClasses = classContext?.isLoadingClasses || false;
    
    const handlePostNotice = commContext?.handlePostNotice || (async () => {});
    const openClass = navContext?.openClass || (() => {});
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [noticeClass, setNoticeClass] = useState<TeacherClass | null>(null);
    const [historyClass, setHistoryClass] = useState<TeacherClass | null>(null);

    const onPostNoticeWrapper = async (text: string) => {
        if (noticeClass) {
            await handlePostNotice(noticeClass.id, text);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-thin text-white tracking-tight">
                        Minhas <span className="font-bold text-brand">Turmas</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-xl">
                        Gerenciamento centralizado de turmas, alunos e comunicação.
                    </p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center px-6 py-3 bg-[#0d1117] border border-brand/30 text-brand font-bold rounded-xl hover:bg-brand hover:text-black hover:shadow-[0_0_20px_rgba(var(--brand-rgb),0.4)] transition-all duration-300"
                >
                    <div className="h-5 w-5 mr-2">{ICONS.plus}</div>
                    <span>Nova Turma</span>
                </button>
            </div>

            {isLoadingClasses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-[#0d1117] rounded-2xl border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : teacherClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <div className="p-6 bg-black rounded-full mb-6 border border-white/10 shadow-xl">
                        <div className="text-slate-500 scale-150">{ICONS.teacher_dashboard}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Sistema em Standby</h3>
                    <p className="text-slate-400 mb-8 text-center max-w-md">Nenhuma turma detectada. Inicialize sua primeira turma para começar a operar.</p>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-8 py-3 bg-brand text-black font-bold rounded-full hover:shadow-[0_0_20px_rgba(var(--brand-rgb),0.5)] transition-all"
                    >
                        Inicializar Turma
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherClasses.map(cls => (
                        <ClassCard 
                            key={cls.id} 
                            classData={cls} 
                            onOpen={() => openClass(cls)}
                            onPostNotice={() => setNoticeClass(cls)}
                            onViewHistory={() => setHistoryClass(cls)}
                        />
                    ))}
                </div>
            )}

            <CreateClassModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCreate={handleCreateClass} 
            />

            {noticeClass && (
                <PostNoticeModal 
                    isOpen={!!noticeClass} 
                    onClose={() => setNoticeClass(null)} 
                    onPost={onPostNoticeWrapper}
                    className={noticeClass.name}
                />
            )}

            {historyClass && (
                <NoticeHistoryModal 
                    isOpen={!!historyClass}
                    onClose={() => setHistoryClass(null)}
                    className={historyClass.name}
                    notices={historyClass.notices || []}
                />
            )}
        </div>
    );
};

export default TeacherClassesList;
