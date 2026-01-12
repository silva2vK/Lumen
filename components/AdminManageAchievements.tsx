
import React from 'react';
import { ICONS } from '../constants/index';
import { useAdminData } from '../contexts/AdminDataContext';
import { useNavigation } from '../contexts/NavigationContext';
import type { Achievement } from '../types';

const AchievementRow: React.FC<{ achievement: Achievement; onEdit: () => void; onDelete: () => void; }> = ({ achievement, onEdit, onDelete }) => {
    const rarityColors = {
        common: 'text-slate-400 border-slate-600 bg-slate-800',
        rare: 'text-blue-400 border-blue-600 bg-blue-900/30',
        epic: 'text-purple-400 border-purple-600 bg-purple-900/30 glow-purple',
    };

    return (
        <tr className="group border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="p-4 align-middle">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex-shrink-0 bg-[#161b22] border border-white/10 rounded flex items-center justify-center">
                        {achievement.imageUrl ? (
                            <img src={achievement.imageUrl} alt="" className="w-8 h-8 object-contain" />
                        ) : (
                            <span className="text-xl">🏆</span>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-slate-200 text-sm">{achievement.title}</p>
                        <p className="text-xs text-slate-500 font-mono truncate max-w-[200px]">{achievement.description}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 align-middle">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${rarityColors[achievement.rarity || 'common']}`}>
                    {achievement.rarity}
                </span>
            </td>
            <td className="p-4 align-middle text-sm font-mono text-yellow-500">
                +{achievement.points} XP
            </td>
            <td className="p-4 align-middle text-xs text-slate-400 font-mono">
                {achievement.criterion}
            </td>
            <td className="p-4 align-middle text-right">
                <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                     <button onClick={onEdit} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                     </button>
                     <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                </div>
            </td>
        </tr>
    );
};

const AdminManageAchievements: React.FC = () => {
    const { achievements, handleDeleteAchievement } = useAdminData();
    const { setCurrentPage, startEditingAchievement } = useNavigation();
    
    const onDeleteAchievement = (achievementId: string) => {
        if (window.confirm("Confirm delete?")) {
            handleDeleteAchievement(achievementId);
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center bg-[#0d1117] p-4 rounded-lg border border-white/10">
                 <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white font-mono flex items-center">
                        <span className="text-yellow-500 mr-2">./</span>
                        Conquistas
                    </h2>
                 </div>
                <button 
                    onClick={() => setCurrentPage('admin_create_achievement')}
                    className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-black text-xs font-bold rounded hover:bg-yellow-500 transition-colors uppercase tracking-wider">
                    <div className="h-4 w-4 mr-2">{ICONS.plus}</div>
                    Nova Conquista
                </button>
            </div>
            
            <div className="bg-[#0d1117] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#161b22] text-xs font-mono font-bold text-slate-400 border-b border-white/10">
                            <th className="p-4 uppercase">Badge / Info</th>
                            <th className="p-4 uppercase">Raridade</th>
                            <th className="p-4 uppercase">Valor</th>
                            <th className="p-4 uppercase">Condição</th>
                            <th className="p-4 text-right uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#0d1117]">
                        {achievements.map(ach => <AchievementRow key={ach.id} achievement={ach} onEdit={() => startEditingAchievement(ach)} onDelete={() => onDeleteAchievement(ach.id)} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminManageAchievements;
