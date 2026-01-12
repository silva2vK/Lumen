
import React, { useState, useEffect } from 'react';
import { useTeacherClassContext } from '../contexts/TeacherClassContext';
import { Card } from './common/Card';
import { SpinnerIcon } from '../constants/index';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebaseClient';
import type { StudentGradeSummaryDoc, Unidade, GradeReportUnidade, GradeReportSubject, GradeReportActivityDetail } from '../types';

const SchoolRecords: React.FC = () => {
    const { teacherClasses } = useTeacherClassContext();
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [studentData, setStudentData] = useState<StudentGradeSummaryDoc | null>(null);
    const [loading, setLoading] = useState(false);

    const selectedClass = teacherClasses.find(c => c.id === selectedClassId);

    // Fetch Student Record when selected
    useEffect(() => {
        if (selectedStudentId && selectedClassId) {
            setLoading(true);
            const fetchRecord = async () => {
                try {
                    // Try to fetch consolidated record
                    const summaryId = `${selectedClassId}_${selectedStudentId}`;
                    const q = query(collection(db, "student_grades"), where("classId", "==", selectedClassId), where("studentId", "==", selectedStudentId));
                    const snap = await getDocs(q); // Should be unique
                    
                    if (!snap.empty) {
                        setStudentData(snap.docs[0].data() as StudentGradeSummaryDoc);
                    } else {
                        setStudentData(null); // No data yet
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            fetchRecord();
        } else {
            setStudentData(null);
        }
    }, [selectedClassId, selectedStudentId]);

    const calculateFinal = () => {
        if (!studentData || !studentData.unidades) return 0;
        let total = 0;
        let count = 0;
        Object.values(studentData.unidades).forEach((unit) => {
            const u = unit as GradeReportUnidade | undefined;
            if (u && u.subjects) {
                Object.values(u.subjects).forEach((subj) => {
                    const s = subj as GradeReportSubject;
                    total += s.totalPoints;
                    count++; // Simplistic average
                });
            }
        });
        return count > 0 ? (total / count) : 0; // Avg per unit/subject block logic
    };

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex gap-4 p-4 bg-[#0d1117] border border-white/10 rounded-xl">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Turma</label>
                    <select 
                        value={selectedClassId} 
                        onChange={e => { setSelectedClassId(e.target.value); setSelectedStudentId(''); }}
                        className="w-full p-2 bg-black border border-slate-700 rounded text-white text-sm"
                    >
                        <option value="">Selecione...</option>
                        {teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aluno</label>
                    <select 
                        value={selectedStudentId} 
                        onChange={e => setSelectedStudentId(e.target.value)}
                        disabled={!selectedClassId}
                        className="w-full p-2 bg-black border border-slate-700 rounded text-white text-sm disabled:opacity-50"
                    >
                        <option value="">Selecione...</option>
                        {selectedClass?.students?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><SpinnerIcon className="h-12 w-12 text-brand" /></div>
                ) : !selectedStudentId ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <span className="text-4xl mb-4">📂</span>
                        <p>Selecione um aluno para visualizar o histórico.</p>
                    </div>
                ) : !studentData ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <span className="text-4xl mb-4">📭</span>
                        <p>Sem registros de notas para este aluno nesta turma.</p>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
                        {/* Summary Header */}
                        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedClass?.students?.find(s=>s.id===selectedStudentId)?.name}</h2>
                                    <p className="text-slate-400 font-mono text-sm">{studentData.className}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Média Geral</p>
                                    <p className="text-4xl font-black text-white">{calculateFinal().toFixed(1)}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Units Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {['1ª Unidade', '2ª Unidade', '3ª Unidade', '4ª Unidade'].map((unitName) => {
                                const unitData = studentData.unidades?.[unitName as Unidade];
                                return (
                                    <div key={unitName} className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
                                        <div className="bg-[#161b22] px-4 py-2 border-b border-white/5 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-300 text-sm uppercase">{unitName}</h3>
                                            {unitData && <span className="text-xs font-mono text-brand">REGISTRADO</span>}
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {unitData ? (
                                                Object.entries(unitData.subjects).map(([subj, rawData]) => {
                                                    const data = rawData as GradeReportSubject;
                                                    return (
                                                        <div key={subj} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                            <div className="flex justify-between items-end mb-1">
                                                                <h4 className="text-sm font-bold text-white">{subj}</h4>
                                                                <span className="text-lg font-bold text-white">{data.totalPoints} <span className="text-xs text-slate-500">/ 10</span></span>
                                                            </div>
                                                            {/* Activity Breakdown */}
                                                            <div className="space-y-1 pl-2 border-l border-white/10">
                                                                {Object.values(data.activities).map(rawAct => {
                                                                    const act = rawAct as GradeReportActivityDetail;
                                                                    return (
                                                                        <div key={act.id} className="flex justify-between text-xs text-slate-400">
                                                                            <span>{act.title}</span>
                                                                            <span>{act.grade}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-xs text-slate-600 italic text-center py-4">Sem lançamentos.</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchoolRecords;
