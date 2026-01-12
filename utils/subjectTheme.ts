
export interface SubjectTheme {
    border: string;
    text: string;
    bg: string;
    gradient: string;
    iconColor: string;
    solid: string;
}

export const getSubjectTheme = (subject?: string | string[]): SubjectTheme => {
    // Normalização defensiva: pega a primeira string se for array, ou string vazia
    const primarySubject = Array.isArray(subject) ? subject[0] : (subject || '');
    const normalized = primarySubject.toLowerCase();

    // Humanas / História (Laranja/Âmbar)
    if (normalized.includes('história')) {
        return { 
            border: 'border-orange-500', 
            text: 'text-orange-400', 
            bg: 'bg-orange-500/10',
            gradient: 'from-orange-500/20 to-amber-600/20',
            iconColor: 'text-orange-500',
            solid: 'bg-orange-500'
        };
    }

    // Geografia (Esmeralda/Verde Terra)
    if (normalized.includes('geografia')) {
        return { 
            border: 'border-emerald-500', 
            text: 'text-emerald-400', 
            bg: 'bg-emerald-500/10',
            gradient: 'from-emerald-500/20 to-green-600/20',
            iconColor: 'text-emerald-500',
            solid: 'bg-emerald-500'
        };
    }

    // Ciências Naturais / Biologia (Ciano/Teal)
    if (normalized.includes('ciências') || normalized.includes('biologia') || normalized.includes('química')) {
        return { 
            border: 'border-cyan-500', 
            text: 'text-cyan-400', 
            bg: 'bg-cyan-500/10',
            gradient: 'from-cyan-500/20 to-teal-600/20',
            iconColor: 'text-cyan-500',
            solid: 'bg-cyan-500'
        };
    }

    // Exatas / Matemática / Física (Indigo/Violeta - Lógica)
    if (normalized.includes('matemática') || normalized.includes('física') || normalized.includes('tecnologia')) {
        return { 
            border: 'border-indigo-500', 
            text: 'text-indigo-400', 
            bg: 'bg-indigo-500/10',
            gradient: 'from-indigo-500/20 to-violet-600/20',
            iconColor: 'text-indigo-500',
            solid: 'bg-indigo-500'
        };
    }

    // Linguagens / Artes (Rosa/Fúcsia - Criatividade)
    if (normalized.includes('português') || normalized.includes('artes') || normalized.includes('literatura') || normalized.includes('redação')) {
        return { 
            border: 'border-pink-500', 
            text: 'text-pink-400', 
            bg: 'bg-pink-500/10',
            gradient: 'from-pink-500/20 to-rose-600/20',
            iconColor: 'text-pink-500',
            solid: 'bg-pink-500'
        };
    }

    // Línguas Estrangeiras (Roxo/Violeta - Comunicação)
    if (normalized.includes('inglês') || normalized.includes('espanhol')) {
        return { 
            border: 'border-violet-500', 
            text: 'text-violet-400', 
            bg: 'bg-violet-500/10',
            gradient: 'from-violet-500/20 to-purple-600/20',
            iconColor: 'text-violet-500',
            solid: 'bg-violet-500'
        };
    }

    // Sociologia / Filosofia (Amarelo - Iluminismo)
    if (normalized.includes('filosofia') || normalized.includes('sociologia')) {
        return { 
            border: 'border-yellow-500', 
            text: 'text-yellow-400', 
            bg: 'bg-yellow-500/10',
            gradient: 'from-yellow-500/20 to-amber-600/20',
            iconColor: 'text-yellow-500',
            solid: 'bg-yellow-500'
        };
    }
    
    // Default (Slate - Neutro)
    return { 
        border: 'border-slate-600', 
        text: 'text-slate-400', 
        bg: 'bg-slate-500/10',
        gradient: 'from-slate-700/20 to-slate-600/20',
        iconColor: 'text-slate-500',
        solid: 'bg-slate-600'
    };
};
