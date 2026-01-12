
export type Role = 'aluno' | 'professor' | 'admin' | 'direcao' | 'responsavel' | 'secretaria' | 'secretaria_estadual' | null;

export type BadgeTier = 'bronze' | 'silver' | 'gold';

// Lazy Loading Summary Type
export interface ClassSummary {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  isArchived?: boolean; 
}

export interface GamificationActionConfig {
    id: string;
    label: string;
    description: string;
    defaultXp: number;
    currentXp: number;
    isImplemented: boolean; // Se false, é uma sugestão/roadmap
}

export interface GamificationConfig {
    actions: Record<string, number>; // map actionId -> xpValue
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  series?: string;
  avatarUrl?: string;
  myClassesSummary?: ClassSummary[]; 
  wards?: string[]; 
  linkedSchoolIds?: string[]; 
  linkedMunicipalities?: string[]; 
}

export type UserStatus = 'Ativo' | 'Pendente' | 'Inativo';

export interface AdminUser extends User {
  registrationDate: string;
  status: UserStatus;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string; 
  points: number;
  unlocked: boolean;
  tier: BadgeTier;
  imageUrl?: string; 
  criterion?: string;
  criterionType?: 'modules' | 'quizzes' | 'activities';
  criterionCount?: number;
  category?: 'social' | 'learning' | 'engagement';
  rarity?: 'common' | 'rare' | 'epic';
  status?: 'Ativa' | 'Inativa';
}

export interface UserGamificationStats {
  quizzesCompleted: number;
  modulesCompleted: number;
  activitiesCompleted: number;
  [key: string]: any; 
}

export interface UserAchievementsDoc {
  xp: number;
  level: number;
  stats: UserGamificationStats;
  unlocked: Record<string, { date: string; seen: boolean }>; 
  updatedAt?: any;
}

export interface ModuleProgress {
  id: string;
  name: string;
  progress: number;
  status: 'Concluído' | 'Em andamento';
}

export interface ClassInfo {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  notices: number;
  activities: number;
}

export interface Notification {
  id: string;
  title: string;
  summary: string;
  urgency: 'low' | 'medium' | 'high';
  deepLink: { page: Page; id?: string };
  read: boolean;
  timestamp: string;
  userId?: string;
  groupCount?: number; 
  type: string;
  actorName?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  xpForNextLevel: number;
  levelName: string;
}

export type Page =
  | 'dashboard'
  | 'modules'
  | 'quizzes'
  | 'activities'
  | 'achievements'
  | 'join_class'
  | 'profile'
  | 'notifications'
  | 'module_view'
  | 'boletim'
  | 'student_activity_view' 
  | 'interactive_map' 
  | 'teacher_dashboard'
  | 'teacher_main_dashboard'
  | 'teacher_create_module'
  | 'teacher_create_activity'
  | 'teacher_create_interactive_activity' 
  | 'teacher_statistics'
  | 'teacher_pending_activities'
  | 'teacher_school_records'
  | 'teacher_repository'
  | 'teacher_module_repository' 
  | 'teacher_grading_view' 
  | 'class_view'
  | 'director_dashboard'
  | 'director_teachers'
  | 'secretariat_dashboard'
  | 'secretariat_schools'
  | 'secretariat_statistics'
  | 'state_secretariat_dashboard'
  | 'guardian_dashboard'
  | 'admin_dashboard'
  | 'admin_users'
  | 'admin_modules'
  | 'admin_quizzes'
  | 'admin_achievements'
  | 'admin_gamification' // NEW
  | 'admin_stats'
  | 'admin_tests'
  | 'admin_diagnostics'
  | 'admin_create_quiz'
  | 'admin_create_achievement'
  | 'admin_create_module'; 

export type ModulePageContentType =
  | 'title'
  | 'paragraph'
  | 'list'
  | 'quote'
  | 'image'
  | 'video'
  | 'divider'
  | 'subtitle';

export interface ModulePageContent {
  type: ModulePageContentType;
  content: string | string[];
  alt?: string; 
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: string; 
}

export interface ModulePage {
  id: number;
  title: string;
  content: ModulePageContent[];
}

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  choices: QuizChoice[];
  correctAnswerId: string;
  mediaUrl?: string; 
}

export type ModuleStatus = 'Concluído' | 'Em progresso' | 'Não iniciado';
export type ModuleDownloadState = 'not_downloaded' | 'downloading' | 'downloaded';

export type HistoricalEra = 'Pré-História' | 'Antiga' | 'Média' | 'Moderna' | 'Contemporânea';

export interface LessonPlan {
  objectives: string;
  generalCompetencies?: string; // Competências Gerais da BNCC
  mobilizedSkills?: string;     // Habilidades Mobilizadas
  methodology: string;
  resources: string;
  evaluation: string;
  bncc?: string;
  thematicUnit?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  videoUrl?: string;
  series?: string | string[]; 
  materia?: string | string[]; 
  subjects?: string[]; 
  difficulty?: 'Fácil' | 'Médio' | 'Difícil';
  duration?: string;
  visibility?: 'specific_class' | 'public';
  classIds?: string[];
  creatorId?: string;
  creatorName?: string; 
  pages: ModulePage[];
  quiz: QuizQuestion[];
  status?: 'Ativo' | 'Inativo' | 'Rascunho'; 
  progress?: number; 
  downloadState?: ModuleDownloadState;
  historicalYear?: number;
  historicalEra?: HistoricalEra;
  lessonPlan?: LessonPlan;
  date?: string;
  createdAt?: any;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  visibility: 'public' | 'specific_class';
  classId?: string;
  questions: QuizQuestion[];
  attempts?: number;
  series?: string | string[]; 
  materia?: string | string[]; 
  subjects?: string[]; 
  createdBy?: string;
  date?: string;
  status?: 'Ativo' | 'Inativo';
  moduleId?: string;
}

// --- ACTIVITY TYPES EXPANSION (AUSUBEL UPDATE) ---
export type ActivityType = 
  | 'Mista' 
  | 'Tarefa (Texto)' 
  | 'Múltipla Escolha' 
  | 'Envio de Arquivo'
  | 'VisualSourceAnalysis'   // Análise de Fonte Visual
  | 'ConceptConnection'      // Conexão de Conceitos
  | 'AdvanceOrganizer'       // Organizador Prévio
  | 'ProgressiveTree'        // Diferenciação Progressiva
  | 'IntegrativeDragDrop';   // Reconciliação Integrativa

export type ActivityItemType = 'text' | 'multiple_choice' | 'file_upload';

// New Interfaces for Ausubel Activities
export interface HotspotItem {
  id: string;
  x: number; // Percentage
  y: number; // Percentage
  label: string; // Correct Answer
  feedback: string;
}

export interface ConnectionPair {
  id: string;
  left: string;
  right: string;
}

export interface TreeData {
  id: string;
  label: string;
  content: string;
  children?: TreeData[];
}

export interface DraggableColumnItem {
  id: string;
  content: string;
  correctColumnId: string; // 'A', 'B', or 'Intersection'
}

// Activity Item Generic
export interface ActivityItem {
  id: string;
  type: ActivityItemType;
  question: string;
  points: number;
  options?: { id: string; text: string }[];
  correctOptionId?: string;
}

export interface ActivitySubmission {
  studentId: string;
  studentName: string;
  studentAvatarUrl?: string; 
  studentSeries?: string; 
  submissionDate: string;
  content: string; // JSON string for all new types
  answers?: Record<string, string>; 
  submittedFiles?: { name: string; url: string }[]; 
  status: 'Aguardando correção' | 'Corrigido' | 'Pendente Envio'; 
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  scores?: Record<string, number>; 
}

export type Unidade = '1ª Unidade' | '2ª Unidade' | '3ª Unidade' | '4ª Unidade';
export type Turno = 'matutino' | 'vespertino' | 'noturno';

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  items?: ActivityItem[]; 
  
  // Specific Data for New Types (Polymorphic)
  visualSourceData?: {
    imageUrl: string;
    hotspots: HotspotItem[];
  };
  conceptConnectionData?: {
    leftColumn: { id: string; text: string }[];
    rightColumn: { id: string; text: string }[];
    pairs: ConnectionPair[];
  };
  advanceOrganizerData?: {
    mediaUrl?: string;
    analogyText: string;
    targetConcept: string;
    linkedModuleId?: string; // New: Optional link to a module
  };
  progressiveTreeData?: {
    root: TreeData;
  };
  integrativeData?: {
    columnA: string;
    columnB: string;
    items: DraggableColumnItem[];
  };

  gradingConfig?: {
    objectiveQuestions: 'automatic' | 'manual';
  };
  
  classId?: string | null; 
  className?: string; 
  creatorId?: string;
  creatorName?: string; 
  unidade?: Unidade;
  materia?: string;
  dueDate?: string;
  points: number;
  attachments?: File[];
  attachmentFiles?: { name: string; url: string }[];
  imageUrl?: string;
  allowFileUpload?: boolean; 
  
  historicalYear?: number;
  historicalEra?: HistoricalEra;

  questions?: QuizQuestion[]; 
  
  isVisible: boolean;
  allowLateSubmissions: boolean;
  submissions?: ActivitySubmission[];
  submissionCount?: number; 
  pendingSubmissionCount?: number; 
  date?: string;
  createdAt?: string | any; 
  moduleId?: string;
  status?: string; 
}

// --- SHARED PROPS FOR ACTIVITY LAYOUTS ---
import React from 'react';
export interface ActivityLayoutProps {
    activity: Activity;
    items: ActivityItem[];
    answers: Record<string, string>;
    handleAnswerChange: (id: string, val: string) => void;
    uploadedFiles: File[];
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isSubmitting: boolean;
    handleSubmit: () => void;
    onBack: () => void;
    renderComplexContent: () => React.ReactNode;
    isSubmitted: boolean;
    submission?: ActivitySubmission;
}

export interface PendingActivity {
    id: string;
    title: string;
    className: string;
    classId: string;
    pendingCount: number;
}

export interface Student {
  id: string;
  name: string;
  avatarUrl: string;
  xp: number;
  level: number;
  overallProgress: number; 
  status?: 'active' | 'inactive'; 
}

export interface ClassNotice {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface TeacherClass {
  id: string;
  name: string;
  code: string;
  coverImageUrl?: string; // New: Custom Class Background
  students: Student[];
  studentCount?: number; 
  activityCount?: number; 
  moduleCount?: number; 
  noticeCount?: number; 
  modules?: Module[]; 
  activities?: Activity[]; 
  notices?: ClassNotice[]; 
  teacherId: string;
  teachers?: string[]; 
  subjects?: Record<string, string>; 
  teacherNames?: Record<string, string>; 
  isFullyLoaded?: boolean; 
  isSummaryOnly?: boolean; 
  inactiveTeachers?: string[]; 
  isArchived?: boolean; 
}

export type InvitationType = 'class_co_teacher' | 'guardian_access_request';

export interface ClassInvitation {
  id: string;
  type: 'class_co_teacher';
  classId: string;
  className: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeEmail: string;
  subject: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface GuardianInvitation {
  id: string;
  type: 'guardian_access_request';
  inviterId: string; 
  inviterName: string;
  inviteeId: string; 
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface GradeReportActivityDetail {
  id: string;
  title: string;
  grade: number;
  maxPoints: number;
  materia: string; 
}

export interface GradeReportSubject {
  activities: Record<string, GradeReportActivityDetail>; 
  totalPoints: number;
}

export interface GradeReportUnidade {
  subjects: {
    [subjectName: string]: GradeReportSubject;
  };
}

export interface ClassGradeReport {
  className: string;
  unidades: {
    [key in Unidade]?: GradeReportUnidade;
  };
}

export interface GradeReport {
  [classId: string]: ClassGradeReport;
}

export interface StudentGradeSummaryDoc extends ClassGradeReport {
    studentId: string;
    classId: string;
    updatedAt: any; 
}

export interface AttendanceSession {
  id: string;
  classId: string;
  date: string; 
  turno: Turno;
  horario: number; 
  createdBy: string; 
  createdAt: string; 
}

export type AttendanceStatus = 'presente' | 'ausente' | 'pendente';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string; 
  status: AttendanceStatus;
  updatedAt: string; 
}

export interface TeacherHistoryDoc {
  classesSummary: ClassSummary[]; 
  notifications: Notification[];
}

export type OfflineActionType = 'SUBMIT_ACTIVITY' | 'GRADE_ACTIVITY' | 'POST_NOTICE';

export interface OfflineAction {
    id: string;
    type: OfflineActionType;
    payload: any; 
    timestamp: number;
    retryCount?: number; 
    lastError?: string; 
}

export interface SchoolData {
    id: string;
    name: string; 
    email: string;
    totalClasses: number;
    totalStudents: number;
    averageAttendance?: number;
    performanceBySubject?: Record<string, number>; 
    activeStudentRate?: number; 
}

export interface MunicipalSecretariatData {
    id: string;
    name: string; 
    email: string;
    totalSchools: number; 
    networkPerformance?: number; 
    dropoutRiskRate?: number; 
}
