
import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';
import type { Module, Quiz, Page, Achievement, TeacherClass, Activity } from '../types';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

interface NavigationState {
    currentPage: Page;
    activeModule: Module | null;
    activeClass: TeacherClass | null;
    activeActivity: Activity | null; // NEW: For Student View
    activeQuiz: Quiz | null; // NEW: For Student Quiz Execution
    gradingActivity: Activity | null; // NEW: For Teacher Grading View
    editingModule: Module | null;
    editingActivity: Activity | null; 
    editingQuiz: Quiz | null;
    editingAchievement: Achievement | null;
    isMobileMenuOpen: boolean;
}

interface NavigationActions {
    setCurrentPage: (page: Page) => void;
    startModule: (module: Module) => void;
    exitModule: () => void;
    openClass: (classData: TeacherClass) => void;
    exitClass: () => void;
    openActivity: (activity: Activity) => void; // NEW: For Student View
    startQuiz: (quiz: Quiz) => void; // NEW: Start quiz execution
    exitQuiz: () => void; // NEW: Exit quiz execution
    startGrading: (activity: Activity) => void; // NEW: For Teacher Grading
    exitGrading: () => void; // NEW: Exit grading
    startEditingModule: (module: Module) => void;
    exitEditingModule: () => void;
    startEditingActivity: (activity: Activity) => void; 
    exitEditingActivity: () => void; 
    startEditingQuiz: (quiz: Quiz) => void;
    exitEditingQuiz: () => void;
    startEditingAchievement: (achievement: Achievement) => void;
    exitEditingAchievement: () => void;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
}

// Separate state and actions for better context usage and performance
const NavigationStateContext = createContext<NavigationState | undefined>(undefined);
const NavigationActionsContext = createContext<NavigationActions | undefined>(undefined);

// FIX: Refactored the provider component to a standard function declaration to resolve errors where the 'children' prop was not being correctly recognized by the type system.
export function NavigationProvider({ children }: { children?: React.ReactNode }) {
    const { authState, userRole } = useAuth();
    const location = useLocation();

    const [currentPage, setCurrentPage] = useState<Page>('dashboard'); // Default to Dashboard (Início)
    const [activeModule, setActiveModule] = useState<Module | null>(null);
    const [activeClass, setActiveClass] = useState<TeacherClass | null>(null);
    const [activeActivity, setActiveActivity] = useState<Activity | null>(null); // NEW
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null); // NEW
    const [gradingActivity, setGradingActivity] = useState<Activity | null>(null); // NEW
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null); 
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (authState === 'authenticated') {
            // Set 'dashboard' as the universal landing page for all roles
            setCurrentPage('dashboard');
        }
    }, [authState]);


    const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
    const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

    // Effect to close the mobile menu whenever the route or page changes
    useEffect(() => {
        closeMobileMenu();
    }, [location.pathname, currentPage, closeMobileMenu]);

    // Effect to reset non-URL state on authentication changes (e.g., logout)
    useEffect(() => {
        if (authState !== 'authenticated') {
            setActiveModule(null);
            setActiveClass(null);
            setActiveActivity(null);
            setActiveQuiz(null);
            setGradingActivity(null);
            setEditingModule(null);
            setEditingActivity(null);
            setEditingQuiz(null);
            setEditingAchievement(null);
        }
    }, [authState]);
    
    const startModule = useCallback((module: Module) => {
        // --- LOCAL-FIRST STRATEGY: SAVE RECENT HISTORY ---
        try {
            const recentKey = 'lumen_recent_modules';
            const rawRecent = localStorage.getItem(recentKey);
            let recent: Module[] = rawRecent ? JSON.parse(rawRecent) : [];
            
            // Remove duplicatas para mover para o topo
            recent = recent.filter(m => m.id !== module.id);
            
            // Cria Snapshot Leve (Sem conteúdo pesado como 'pages')
            const snapshot = {
                id: module.id,
                title: module.title,
                description: module.description,
                coverImageUrl: module.coverImageUrl,
                materia: module.materia,
                series: module.series,
                progress: module.progress,
                // Campos obrigatórios vazios para satisfazer tipo
                pages: [], 
                quiz: []
            };
            
            // Adiciona ao topo
            recent.unshift(snapshot as Module);
            
            // Limita a 5 itens
            if (recent.length > 5) recent = recent.slice(0, 5);
            
            localStorage.setItem(recentKey, JSON.stringify(recent));
        } catch (e) {
            console.error("Falha ao salvar histórico recente:", e);
        }
        // -----------------------------------------------

        setActiveModule(module);
        setCurrentPage('module_view');
    }, []);

    const exitModule = useCallback(() => {
        setActiveModule(null);
        setCurrentPage('modules');
    }, []);

    const openClass = useCallback((classData: TeacherClass) => {
        setActiveClass(classData);
        setCurrentPage('class_view');
    }, []);

    const exitClass = useCallback(() => {
        setActiveClass(null);
        // Retorna para o dashboard correto baseado no papel
        if (userRole === 'direcao') {
            setCurrentPage('director_dashboard');
        } else {
            setCurrentPage('teacher_dashboard');
        }
    }, [userRole]);

    const openActivity = useCallback((activity: Activity) => {
        setActiveActivity(activity);
        setCurrentPage('student_activity_view');
    }, []);

    // Quiz Execution Actions
    const startQuiz = useCallback((quiz: Quiz) => {
        setActiveQuiz(quiz);
        // We stay on 'quizzes' page but the view changes internally, 
        // passing state allows App.tsx to know we are focused.
    }, []);

    const exitQuiz = useCallback(() => {
        setActiveQuiz(null);
    }, []);

    const startGrading = useCallback((activity: Activity) => {
        setGradingActivity(activity);
        setCurrentPage('teacher_grading_view');
    }, []);

    const exitGrading = useCallback(() => {
        setGradingActivity(null);
        // Default to pending activities, user can navigate elsewhere
        setCurrentPage('teacher_pending_activities');
    }, []);

    const startEditingModule = useCallback((module: Module) => {
        setEditingModule(module);
        // Redirect based on role
        if (userRole === 'admin') {
            setCurrentPage('admin_create_module');
        } else {
            setCurrentPage('teacher_create_module');
        }
    }, [userRole]);

    const exitEditingModule = useCallback(() => {
        setEditingModule(null);
        setCurrentPage(userRole === 'admin' ? 'admin_modules' : 'teacher_dashboard');
    }, [userRole]);

    // NEW: Activity Editing
    const startEditingActivity = useCallback((activity: Activity) => {
        setEditingActivity(activity);
        setCurrentPage('teacher_create_activity');
    }, []);

    const exitEditingActivity = useCallback(() => {
        setEditingActivity(null);
        setCurrentPage('teacher_repository');
    }, []);

    const startEditingQuiz = useCallback((quiz: Quiz) => {
        setEditingQuiz(quiz);
        // Redirect based on role (only admins currently edit quizzes here, but good practice)
        if (userRole === 'admin') {
            setCurrentPage('admin_create_quiz');
        } else {
             // Fallback, though teachers usually create via activities
             setCurrentPage('admin_create_quiz'); 
        }
    }, [userRole]);

    const exitEditingQuiz = useCallback(() => {
        setEditingQuiz(null);
        setCurrentPage('admin_quizzes');
    }, []);
    
    const startEditingAchievement = useCallback((achievement: Achievement) => {
        setEditingAchievement(achievement);
        setCurrentPage('admin_create_achievement');
    }, []);

    const exitEditingAchievement = useCallback(() => {
        setEditingAchievement(null);
        setCurrentPage('admin_achievements');
    }, []);

    const stateValue: NavigationState = { currentPage, activeModule, activeClass, activeActivity, activeQuiz, gradingActivity, editingModule, editingActivity, editingQuiz, editingAchievement, isMobileMenuOpen };
    const actionsValue: NavigationActions = { 
        setCurrentPage,
        startModule, 
        exitModule, 
        openClass,
        exitClass,
        openActivity,
        startQuiz,
        exitQuiz,
        startGrading,
        exitGrading,
        startEditingModule, 
        exitEditingModule,
        startEditingActivity,
        exitEditingActivity,
        startEditingQuiz, 
        exitEditingQuiz, 
        startEditingAchievement,
        exitEditingAchievement,
        toggleMobileMenu, 
        closeMobileMenu 
    };

    return (
        <NavigationStateContext.Provider value={stateValue}>
            <NavigationActionsContext.Provider value={actionsValue}>
                {children}
            </NavigationActionsContext.Provider>
        </NavigationStateContext.Provider>
    );
}

// Custom hooks to consume the separated contexts. These are now internal to the module.
const useNavigationState = (): NavigationState => {
    const context = useContext(NavigationStateContext);
    if (context === undefined) {
        throw new Error('useNavigationState must be used within a NavigationProvider');
    }
    return context;
};

const useNavigationActions = (): NavigationActions => {
    const context = useContext(NavigationActionsContext);
    if (context === undefined) {
        throw new Error('useNavigationActions must be used within a NavigationProvider');
    }
    return context;
};

// This is the single hook exported for components to use, resolving potential circular dependencies.
export const useNavigation = (): NavigationState & NavigationActions => {
    const state = useNavigationState();
    const actions = useNavigationActions();
    return { ...state, ...actions };
};
