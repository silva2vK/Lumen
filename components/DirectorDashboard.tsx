
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseClient';
import type { TeacherClass, User } from '../types';
import { Card } from './common/Card';
import { ICONS, SpinnerIcon } from '../constants/index';
import { useNavigation } from '../contexts/NavigationContext';
import { Modal } from './common/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const StatCard: React.FC<{ title: string; value: string | number; description: string; icon: React.ReactNode; iconBgColor: string; iconTextColor: string }> = ({ title, value, description, icon, iconBgColor, iconTextColor }) => (
    <Card>
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold text-slate-600 dark:text-slate-300 hc-text-secondary">{title}</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-1 hc-text-primary text-3xl">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hc-text-secondary">{description}</p>
            </div>
            <div className={`p-3 rounded-full ${iconBgColor} ${iconTextColor}`}>
                {icon}
            </div>
        </div>
    </Card>
);

// --- Modal de Criação de Turma pela Direção ---
interface CreateClassDirectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    teachers: User[];
    onCreate: (className: string, teacherId: string) => Promise<void>;
}

const CreateClassDirectorModal: React.FC<CreateClassDirectorModalProps> = ({ isOpen, onClose, teachers, onCreate }) => {
    const [className, setClassName] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (className.trim() && selectedTeacher && !isCreating) {
            setIsCreating(true);
            try {
                await onCreate(className.trim(), selectedTeacher);
                setClassName('');
                setSelectedTeacher('');
                onClose();
            } finally {
                setIsCreating(false);
            }
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setClassName('');
            setSelectedTeacher('');
            setIsCreating(false);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Turma (Administrativo)">
            <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Crie uma turma e atribua um professor regente. A turma aparecerá automaticamente no painel do professor selecionado.
                </p>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Nome da Turma <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="Ex: 9º Ano B - Matutino"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Professor Regente <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        <option value="">Selecione um professor...</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-slate-700 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500 dark:hover:bg-slate-500"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!className.trim() || !selectedTeacher || isCreating}
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                    >
                        {isCreating ? <SpinnerIcon className="h-5 w-5" /> : 'Criar Turma'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const DirectorDashboard: React.FC = () => {
    const { openClass } = useNavigation();
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [allClasses, setAllClasses] = useState<TeacherClass[]>([]);
    const [allTeachers, setAllTeachers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Função para buscar dados
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch all classes (Director View)
            const classesSnap = await getDocs(collection(db, "classes"));
            const classes = classesSnap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                isFullyLoaded: false
            } as TeacherClass));

            // 2. Fetch all teachers
            const usersSnap = await getDocs(query(collection(db, "users")));
            const teachers = usersSnap.docs
                .map(d => ({ id: d.id, ...d.data() } as User))
                .filter(u => u.role === 'professor');

            setAllClasses(classes);
            setAllTeachers(teachers);
        } catch (error) {
            console.error("Erro ao carregar dados da direção:", error);
            addToast("Erro ao carregar dados.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateClass = async (className: string, teacherId: string) => {
        if (!user) return;
        
        try {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const teacherName = allTeachers.find(t => t.id === teacherId)?.name || 'Professor';

            const newClassPayload = {
                name: className,
                teacherId: teacherId, // Define o professor selecionado como dono
                teachers: [teacherId],
                subjects: { [teacherId]: 'Regente' },
                teacherNames: { [teacherId]: teacherName },
                code,
                students: [],
                studentCount: 0,
                notices: [],
                noticeCount: 0,
                createdAt: serverTimestamp(),
                createdBy: user.id, // Auditoria: quem criou foi o diretor
                creatorRole: 'direcao',
                isArchived: false
            };

            await addDoc(collection(db, "classes"), newClassPayload);
            addToast(`Turma "${className}" criada com sucesso!`, "success");
            
            // Recarrega a lista para mostrar a nova turma
            fetchData();
        } catch (error) {
            console.error("Erro ao criar turma:", error);
            addToast("Erro ao criar turma.", "error");
        }
    };

    const stats = useMemo(() => {
        const totalClasses = allClasses.length;
        const activeTeachers = new Set(allClasses.flatMap(c => c.teachers || [c.teacherId])).size;
        const totalStudents = allClasses.reduce((acc, c) => acc + (c.studentCount || (c.students?.length) || 0), 0);
        const totalActivities = allClasses.reduce((acc, c) => acc + (c.activityCount || 0), 0);
        const avgActivities = totalClasses > 0 ? (totalActivities / totalClasses).toFixed(1) : "0";

        return { totalClasses, activeTeachers, totalStudents, avgActivities };
    }, [allClasses]);

    const filteredClasses = useMemo(() => {
        return allClasses.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allClasses, searchTerm]);

    const handleEnterClass = (cls: TeacherClass) => {
        openClass(cls);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><SpinnerIcon className="h-12 w-12 text-indigo-500" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 hc-text-primary">Torre de Controle</h1>
                    <p className="text-slate-500 dark:text-slate-400 hc-text-secondary">Visão geral e supervisão pedagógica.</p>
                </div>
                
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors hc-button-primary-override"
                >
                    <div className="h-5 w-5 mr-2">{ICONS.plus}</div>
                    <span>Nova Turma</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total de Turmas" 
                    value={stats.totalClasses} 
                    description="Turmas ativas na escola" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} 
                    iconBgColor="bg-blue-100 dark:bg-blue-900/50" 
                    iconTextColor="text-blue-600 dark:text-blue-300" 
                />
                <StatCard 
                    title="Corpo Docente" 
                    value={stats.activeTeachers} 
                    description="Professores com turmas atribuídas" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} 
                    iconBgColor="bg-purple-100 dark:bg-purple-900/50" 
                    iconTextColor="text-purple-600 dark:text-purple-300" 
                />
                <StatCard 
                    title="Alunos Matriculados" 
                    value={stats.totalStudents} 
                    description="Total de alunos no sistema" 
                    icon={ICONS.students} 
                    iconBgColor="bg-emerald-100 dark:bg-emerald-900/50" 
                    iconTextColor="text-emerald-600 dark:text-emerald-300" 
                />
                <StatCard 
                    title="Fluxo de Atividades" 
                    value={stats.avgActivities} 
                    description="Média de atividades por turma" 
                    icon={ICONS.activities} 
                    iconBgColor="bg-amber-100 dark:bg-amber-900/50" 
                    iconTextColor="text-amber-600 dark:text-amber-300" 
                />
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Grade de Turmas</h2>
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Buscar turma..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                <th className="p-4">Turma</th>
                                <th className="p-4">Código</th>
                                <th className="p-4">Regente Principal</th>
                                <th className="p-4">Alunos</th>
                                <th className="p-4">Atividades</th>
                                <th className="p-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredClasses.length > 0 ? (
                                filteredClasses.map(cls => {
                                    const teacherName = allTeachers.find(t => t.id === cls.teacherId)?.name || 'Desconhecido';
                                    return (
                                        <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{cls.name}</td>
                                            <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">{cls.code}</td>
                                            <td className="p-4 text-slate-700 dark:text-slate-300">{teacherName}</td>
                                            <td className="p-4">
                                                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full dark:bg-emerald-900/30 dark:text-emerald-300">
                                                    {cls.studentCount || (cls.students?.length) || 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                                {cls.activityCount || 0} criadas
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleEnterClass(cls)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-semibold hover:underline"
                                                >
                                                    Inspecionar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        Nenhuma turma encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <CreateClassDirectorModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                teachers={allTeachers}
                onCreate={handleCreateClass}
            />
        </div>
    );
};

export default DirectorDashboard;
