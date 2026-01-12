
import React from 'react';
import { useStudentGamificationContext } from '../contexts/StudentGamificationContext';
import { SpinnerIcon, ICONS } from '../constants/index';
import type { Achievement } from '../types';

const BadgeCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const isUnlocked = achievement.unlocked;
    const tierColor = achievement.tier === 'gold' ? 'text-yellow-400 border-yellow-500/50 bg-yellow-900/10' :
                      achievement.tier === 'silver' ? 'text-slate-300 border-slate-400/50 bg-slate-800/50' :
                      'text-orange-400 border-orange-500/50 bg-orange-900/10'; // Bronze

    return (
        <div className={`relative p-6 rounded-2xl border transition-all duration-500 ${isUnlocked ? `${tierColor} shadow-lg` : 'border-white/5 bg-white/5 opacity-50 grayscale'}`}>
            {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
            )}
            
            <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 mb-4 rounded-full flex items-center justify-center text-4xl border-2 ${isUnlocked ? 'border-current bg-black/20 shadow-inner' : 'border-slate-700 bg-slate-800'}`}>
                    {achievement.imageUrl ? (
                        <img src={achievement.imageUrl} alt={achievement.title} className="w-12 h-12 object-contain" />
                    ) : (
                        <span>🏆</span>
                    )}
                </div>
                
                <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                <p className="text-xs opacity-70 mb-3 h-8 line-clamp-2">{achievement.description}</p>
                
                {isUnlocked ? (
                    <span className="text-[10px] font-mono uppercase tracking-widest border border-current px-2 py-0.5 rounded-full">
                        Desbloqueado em {achievement.date}
                    </span>
                ) : (
                    <span className="text-[10px] font-mono uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded-full">
                        Bloqueado
                    </span>
                )}
            </div>
        </div>
    );
};

const Achievements: React.FC = () => {
    const { achievements, userStats } = useStudentGamificationContext();

    if (!achievements) {
        return (
            <div className="flex justify-center items-center h-full">
                <SpinnerIcon className="h-12 w-12 text-yellow-500" />
            </div>
        );
    }

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header / Stats */}
            <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl select-none">🏆</div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
                            Galeria de <span className="text-yellow-500">Conquistas</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-mono max-w-lg">
                            Colecione medalhas completando missões, quizzes e mantendo sua frequência.
                        </p>
                    </div>

                    <div className="flex gap-8 text-center">
                        <div>
                            <p className="text-3xl font-black text-white">{unlockedCount}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Desbloqueadas</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-yellow-500">{userStats.xp}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">XP Total</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-brand">{userStats.level}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nível</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-right text-[10px] text-slate-500 mt-1 font-mono">{progress.toFixed(0)}% Completo</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {achievements.map(ach => (
                    <BadgeCard key={ach.id} achievement={ach} />
                ))}
            </div>
        </div>
    );
};

export default Achievements;
