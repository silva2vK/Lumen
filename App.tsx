
import React, { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { DebugTools } from './components/common/DebugTools';
import { SecurityGate } from './components/common/SecurityGate';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { RoleSelectionPage } from './components/RoleSelectionPage';
import { YearSelectionPage } from './components/YearSelectionPage';
import type { Page, Role } from './types';
import './styles/themes.css';
import './styles/admin.css';

// Performance & Capabilities
import { configureEnvironment } from './utils/capabilities';

// Providers
import { AppProviders } from './components/AppProviders';
import { StudentContextWrapper, TeacherContextWrapper, AdminContextWrapper, SecretariatContextWrapper, StateSecretariatContextWrapper } from './components/RoleContextWrappers';
import { useSettings } from './contexts/SettingsContext';

// Lazy-loaded page components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Modules = lazy(() => import('./components/Modules'));
const Quizzes = lazy(() => import('./components/Quizzes'));
const Activities = lazy(() => import('./components/Activities'));
const StudentActivityResponse = lazy(() => import('./components/StudentActivityResponse'));
const Achievements = lazy(() => import('./components/Achievements'));
const JoinClass = lazy(() => import('./components/JoinClass'));
const Profile = lazy(() => import('./components/Profile'));
const AdminProfileView = lazy(() => import('./components/AdminProfileView').then(m => ({ default: m.AdminProfileView })));
const NotificationsPage = lazy(() => import('./components/NotificationsPage'));
const ModuleViewPage = lazy(() => import('./components/ModuleViewPage'));
const Boletim = lazy(() => import('./components/Boletim'));
const InteractiveMap = lazy(() => import('./components/InteractiveMap'));

// Teacher Components
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const TeacherClassesList = lazy(() => import('./components/TeacherClassesList'));
const ModuleCreator = lazy(() => import('./components/ModuleCreator'));
const CreateActivity = lazy(() => import('./components/CreateActivity'));
const CreateInteractiveActivity = lazy(() => import('./components/CreateInteractiveActivity'));
const TeacherStatistics = lazy(() => import('./components/TeacherStatistics'));
const PendingActivities = lazy(() => import('./components/PendingActivities'));
const TeacherGradingView = lazy(() => import('./components/TeacherGradingView'));
const SchoolRecords = lazy(() => import('./components/SchoolRecords'));
const ClassView = lazy(() => import('./components/ClassView'));
const TeacherRepository = lazy(() => import('./components/TeacherRepository'));
const TeacherModuleRepository = lazy(() => import('./components/TeacherModuleRepository'));

// Director Components
const DirectorDashboard = lazy(() => import('./components/DirectorDashboard'));

// Secretariat Components
const SecretariatDashboard = lazy(() => import('./components/SecretariatDashboard'));

// State Secretariat Components
const StateSecretariatDashboard = lazy(() => import('./components/StateSecretariatDashboard'));

// Guardian Components
const GuardianDashboard = lazy(() => import('./components/GuardianDashboard'));
const GuardianQuizzes = lazy(() => import('./components/GuardianQuizzes'));

// Admin Components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminManageUsers = lazy(() => import('./components/AdminManageUsers'));
const AdminManageModules = lazy(() => import('./components/AdminManageModules'));
const AdminManageQuizzes = lazy(() => import('./components/AdminManageQuizzes'));
const AdminManageAchievements = lazy(() => import('./components/AdminManageAchievements'));
const AdminGamification = lazy(() => import('./components/AdminGamification'));
const AdminStats = lazy(() => import('./components/AdminStats'));
const AdminTests = lazy(() => import('./components/AdminTests'));
const AdminDiagnostics = lazy(() => import('./components/AdminDiagnostics'));
const CreateAchievement = lazy(() => import('./components/CreateAchievement'));
const AdminCreateModule = lazy(() => import('./components/AdminCreateModule'));
const AdminCreateQuiz = lazy(() => import('./components/AdminCreateQuiz'));

const PAGE_TITLES: Record<string, string> = {
    dashboard: 'Início',
    modules: 'Módulos',
    quizzes: 'Quizzes',
    activities: 'Atividades',
    achievements: 'Conquistas',
    join_class: 'Turmas',
    profile: 'Meu Perfil',
    notifications: 'Notificações',
    boletim: 'Boletim',
    interactive_map: 'Mapa Interativo',
    teacher_dashboard: 'Minhas Turmas',
    teacher_statistics: 'Estatísticas',
    teacher_school_records: 'Histórico Escolar',
    teacher_repository: 'Banco de Questões',
    teacher_module_repository: 'Banco de Módulos',
    director_dashboard: 'Painel da Direção',
    secretariat_dashboard: 'Painel da Secretaria',
    secretariat_schools: 'Monitoramento de Escolas',
    secretariat_statistics: 'Estatísticas Estaduais',
    state_secretariat_dashboard: 'Painel Estadual',
    guardian_dashboard: 'Painel do Responsável',
    admin_dashboard: 'Painel do Administrador',
    admin_users: 'Gerenciar Usuários',
    admin_modules: 'Gerenciar Módulos',
    admin_quizzes: 'Gerenciar Quizzes',
    admin_achievements: 'Gerenciar Conquistas',
    admin_gamification: 'Gamificação & XP',
    admin_stats: 'Estatísticas da Plataforma',
    admin_tests: 'Painel de Testes',
    admin_diagnostics: 'Diagnóstico do Sistema',
};

const LoadingSpinner: React.FC = () => (
    <div role="status" className="flex justify-center items-center h-full pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand"></div>
        <span className="sr-only">Carregando conteúdo...</span>
    </div>
);

const MainLayout: React.FC = () => {
    const { userRole } = useAuth();
    const { currentPage, activeModule, activeClass, activeActivity, activeQuiz, gradingActivity, toggleMobileMenu, isMobileMenuOpen } = useNavigation();
    const { wallpaper, enableWallpaperMask, globalTheme, enableFocusMode } = useSettings();
    
    const [isScrolled, setIsScrolled] = useState(false);
    const mainContentRef = useRef<HTMLElement>(null);

    // Initial Environment Config (GPU check, etc)
    useEffect(() => {
        configureEnvironment();
    }, []);

    useEffect(() => {
        const mainEl = mainContentRef.current;
        if (!mainEl) return;
        const handleScroll = () => setIsScrolled(mainEl.scrollTop > 20);
        mainEl.addEventListener('scroll', handleScroll, { passive: true });
        return () => mainEl.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
        document.getElementById('page-main-heading')?.focus({ preventScroll: true });
    }, [currentPage]);

    const renderPage = () => {
        if (userRole === 'admin') {
            switch (currentPage) {
                case 'admin_dashboard': return <AdminDashboard />;
                case 'admin_users': return <AdminManageUsers />;
                case 'admin_modules': return <AdminManageModules />;
                case 'admin_quizzes': return <AdminManageQuizzes />;
                case 'admin_achievements': return <AdminManageAchievements />;
                case 'admin_gamification': return <AdminGamification />;
                case 'admin_stats': return <AdminStats />;
                case 'admin_tests': return <AdminTests />;
                case 'admin_diagnostics': return <AdminDiagnostics />;
                case 'admin_create_module': return <AdminCreateModule />;
                case 'admin_create_quiz': return <AdminCreateQuiz />;
                case 'admin_create_achievement': return <CreateAchievement />;
                case 'profile': return <AdminProfileView />;
                default: return <AdminDashboard />;
            }
        }

        if (userRole === 'direcao') {
            switch (currentPage) {
                case 'director_dashboard': return <DirectorDashboard />;
                case 'class_view': return <ClassView />;
                case 'teacher_statistics': return <TeacherStatistics />;
                case 'teacher_school_records': return <SchoolRecords />;
                case 'modules': return <Modules />;
                case 'module_view': return activeModule ? <ModuleViewPage /> : <Modules />;
                case 'profile': return <Profile />;
                default: return <DirectorDashboard />;
            }
        }

        if (userRole === 'secretaria') {
            switch (currentPage) {
                case 'secretariat_dashboard': return <SecretariatDashboard />;
                case 'profile': return <Profile />;
                default: return <SecretariatDashboard />;
            }
        }

        if (userRole === 'secretaria_estadual') {
            switch (currentPage) {
                case 'state_secretariat_dashboard': return <StateSecretariatDashboard />;
                case 'profile': return <Profile />;
                default: return <StateSecretariatDashboard />;
            }
        }

        if (userRole === 'responsavel') {
            switch (currentPage) {
                case 'guardian_dashboard': return <GuardianDashboard />;
                case 'modules': return <Modules />;
                case 'quizzes': return <GuardianQuizzes />;
                case 'module_view': return activeModule ? <ModuleViewPage /> : <Modules />;
                case 'profile': return <Profile />;
                default: return <GuardianDashboard />;
            }
        }

        if (userRole === 'professor') {
            switch (currentPage) {
                case 'dashboard': return <TeacherDashboard />;
                case 'teacher_dashboard': return <TeacherClassesList />;
                case 'teacher_pending_activities': return <PendingActivities />;
                case 'modules': return <Modules />;
                case 'teacher_create_module': return <ModuleCreator />;
                case 'teacher_create_activity': return <CreateActivity />;
                case 'teacher_create_interactive_activity': return <CreateInteractiveActivity />;
                case 'teacher_repository': return <TeacherRepository />;
                case 'teacher_module_repository': return <TeacherModuleRepository />;
                case 'teacher_statistics': return <TeacherStatistics />;
                case 'teacher_school_records': return <SchoolRecords />;
                case 'class_view': return <ClassView />;
                case 'teacher_grading_view': return gradingActivity ? <TeacherGradingView /> : <PendingActivities />;
                case 'profile': return <Profile />;
                case 'module_view': return activeModule ? <ModuleViewPage /> : <Modules />;
                case 'interactive_map': return <InteractiveMap />;
                default: return <TeacherDashboard />;
            }
        }
        
        switch (currentPage) {
            case 'dashboard': return <Dashboard />;
            case 'modules': return <Modules />;
            case 'quizzes': return <Quizzes />;
            case 'activities': return <Activities />;
            case 'achievements': return <Achievements />;
            case 'join_class': return <JoinClass />;
            case 'profile': return <Profile />;
            case 'notifications': return <NotificationsPage />;
            case 'boletim': return <Boletim />;
            case 'interactive_map': return <InteractiveMap />;
            case 'module_view': return activeModule ? <ModuleViewPage /> : <Modules />;
            case 'student_activity_view': return activeActivity ? <StudentActivityResponse /> : <Activities />;
            default: return <Dashboard />;
        }
    };
    
    let pageTitle = PAGE_TITLES[currentPage] || 'Lumen';
    if (currentPage === 'module_view' && activeModule) pageTitle = activeModule.title;
    if (currentPage === 'class_view' && activeClass) pageTitle = activeClass.name;

    const activeWallpaper = wallpaper;
    const hasGlobalTheme = globalTheme.desktop || globalTheme.mobile;

    // Focus Mode Logic
    const isFocusMode = enableFocusMode && (
        currentPage === 'module_view' || 
        currentPage === 'student_activity_view' || 
        (currentPage === 'quizzes' && !!activeQuiz)
    );

    // Dynamic Style Construction
    const backgroundGradient = (!isFocusMode && enableWallpaperMask) 
        ? 'linear-gradient(45deg, rgb(var(--bg-main-rgb) / 0.98) 0%, rgb(var(--bg-main-rgb) / 0.85) 40%, rgb(var(--bg-main-rgb) / 0.4) 100%)' 
        : (!isFocusMode && !activeWallpaper) 
            ? 'linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))'
            : 'transparent';

    return (
        <div className={`relative flex h-screen overflow-hidden ${userRole === 'admin' ? 'admin-container' : ''}`} style={{ backgroundColor: 'var(--bg-main)' }}>
            <SecurityGate />
            <OfflineIndicator />
            
            {/* Wallpaper Layer (Z-0) */}
            {!isFocusMode && activeWallpaper ? (
                <div className="absolute inset-0 z-0">
                    <img src={activeWallpaper} alt="" className="w-full h-full object-cover opacity-90" />
                </div>
            ) : !isFocusMode && hasGlobalTheme ? (
                <div className="absolute inset-0 z-0">
                    <picture>
                        {globalTheme.mobile && <source media="(max-width: 768px)" srcSet={globalTheme.mobile} />}
                        <img src={globalTheme.desktop || globalTheme.mobile || ''} alt="" className="w-full h-full object-cover opacity-90" />
                    </picture>
                </div>
            ) : null}

            {/* Mask/Gradient Layer (Z-1) */}
            <div 
                className="absolute inset-0 z-[1] pointer-events-none transition-all duration-700 ease-in-out" 
                style={{ background: backgroundGradient }} 
            />

            {/* Content Layer (Z-10) */}
            <div className="relative z-10 flex h-full w-full">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <button 
                        onClick={toggleMobileMenu} 
                        className={`fixed top-4 left-4 z-50 w-12 h-12 flex items-center justify-center rounded-xl border transition-all duration-300 group shadow-lg ${isMobileMenuOpen ? 'bg-black border-red-500/30 text-red-400 hover:border-red-500' : 'bg-black border-white/10 text-slate-300 hover:border-brand/50 hover:text-brand'}`} 
                        aria-label={isMobileMenuOpen ? "Fechar Menu" : "Abrir Menu"}
                    >
                        <div className="relative w-5 h-4">
                            <span className={`absolute left-0 h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'}`} />
                            <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
                            <span className={`absolute left-0 h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'}`} />
                        </div>
                    </button>
                    <Header title={pageTitle} isScrolled={isScrolled} />
                    <main id="main-content" ref={mainContentRef} className="flex-1 overflow-y-auto pb-6 sm:pb-8 lg:pb-10 pt-0 px-3 sm:px-4 lg:px-6 relative custom-scrollbar" tabIndex={-1}>
                        <ErrorBoundary>
                            <Suspense fallback={<LoadingSpinner />}>
                                <div className="h-full w-full max-w-[1920px] mx-auto">{renderPage()}</div>
                            </Suspense>
                        </ErrorBoundary>
                    </main>
                </div>
            </div>
        </div>
    );
};

const AuthenticatedAppContent = () => {
    const { userRole } = useAuth();
    return (
        <NavigationProvider>
            {userRole === 'aluno' && <StudentContextWrapper><MainLayout /></StudentContextWrapper>}
            {(userRole === 'professor' || userRole === 'direcao') && <TeacherContextWrapper><MainLayout /></TeacherContextWrapper>}
            {(userRole === 'admin' || userRole === 'responsavel') && <AdminContextWrapper><MainLayout /></AdminContextWrapper>}
            {userRole === 'secretaria' && <SecretariatContextWrapper><MainLayout /></SecretariatContextWrapper>}
            {userRole === 'secretaria_estadual' && <StateSecretariatContextWrapper><MainLayout /></StateSecretariatContextWrapper>}
        </NavigationProvider>
    );
};

const AppContent = () => {
    const { authState, user, createUserProfile, authError } = useAuth();
    const [onboardingStep, setOnboardingStep] = useState<'role' | 'year'>('role');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [onboardingError, setOnboardingError] = useState<string | null>(null);

    if (authState === 'loading') return <LoadingSpinner />;
    if (authState === 'unauthenticated') return <><OfflineIndicator /><LoginPage initialError={authError} /></>;
    
    if (user && !user.role) {
        if (onboardingStep === 'role') {
            return <RoleSelectionPage error={onboardingError} onRoleSelected={async (role) => {
                setOnboardingError(null);
                if (role === 'aluno') { setSelectedRole('aluno'); setOnboardingStep('year'); } 
                else { try { await createUserProfile(role); } catch (e: any) { setOnboardingError(e.message); } }
            }} />;
        }
        return <YearSelectionPage error={onboardingError} onYearSelected={async (year) => {
            setOnboardingError(null);
            if (selectedRole) { try { await createUserProfile(selectedRole, year); } catch (e: any) { setOnboardingError(e.message); } }
        }} />;
    }

    return <AuthenticatedAppContent />;
};

const App = () => (
    <AppProviders>
        <DebugTools />
        <AppContent />
    </AppProviders>
);

export default App;
