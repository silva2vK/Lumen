
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import type { Role, User } from '../types';
import { supabase } from '../components/supabaseClient';
import { Session } from '@supabase/supabase-js';

type AuthState = 'unauthenticated' | 'authenticated' | 'loading';

interface AuthContextType {
    authState: AuthState;
    user: User | null;
    userRole: Role;
    authError: string | null;
    signInWithEmail: (email: string, pass: string) => Promise<void>;
    signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    handleLogout: () => void;
    updateUser: (updatedData: Partial<User>) => Promise<void>;
    createUserProfile: (role: Role, series?: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children?: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>('loading');
    const [user, setUser] = useState<User | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    // Função auxiliar para formatar erros do Supabase
    const handleSupabaseError = (error: any): string => {
        console.error("Supabase Auth Error Full Object:", error);
        const msg = error.message || JSON.stringify(error);
        
        if (msg.includes("Invalid login credentials")) return "Email ou senha incorretos. (Lembre-se: usuários antigos do Firebase precisam se cadastrar novamente)";
        if (msg.includes("Email not confirmed")) return "Verifique seu email para confirmar o cadastro.";
        if (msg.includes("User already registered")) return "Este email já está cadastrado.";
        
        return msg || "Ocorreu um erro desconhecido.";
    };

    // Busca o perfil do usuário na tabela 'public.users'
    const fetchUserProfile = async (userId: string, email: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Se o erro for "PGRST116", significa que o usuário não existe na tabela users (mas existe no Auth)
                if (error.code === 'PGRST116') {
                     const partialUser: User = {
                        id: userId,
                        name: email.split('@')[0],
                        email: email,
                        role: null,
                    };
                    setUser(partialUser);
                    setAuthState('authenticated');
                    return;
                }
                throw error;
            }

            if (data) {
                const appUser: User = {
                    id: userId,
                    name: data.name,
                    email: email,
                    role: data.role as Role,
                    series: data.series,
                    avatarUrl: data.avatar_url // snake_case from DB
                };
                setUser(appUser);
                setAuthState('authenticated');
            }
        } catch (error: any) {
            console.error("Erro ao buscar perfil:", error);
            setAuthError("Erro ao carregar dados do usuário.");
            // Não bloqueia o login, mas deixa o user sem role
            const partialUser: User = { id: userId, name: email.split('@')[0], email: email, role: null };
            setUser(partialUser);
            setAuthState('authenticated');
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user.id, session.user.email!);
            } else {
                setAuthState('unauthenticated');
                setUser(null);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                if (!user || user.id !== session.user.id) {
                    fetchUserProfile(session.user.id, session.user.email!);
                }
            } else {
                setUser(null);
                setAuthState('unauthenticated');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, pass: string) => {
        setAuthError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });

        if (error) {
            const msg = handleSupabaseError(error);
            setAuthError(msg);
            throw new Error(msg);
        }
    };

    const signUpWithEmail = async (name: string, email: string, pass: string) => {
        setAuthError(null);
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            const msg = handleSupabaseError(error);
            setAuthError(msg);
            throw new Error(msg);
        }

        // Correção RLS: Apenas tenta inserir na tabela pública se houver uma sessão válida.
        // Se o email precisar de confirmação, data.session será null, e a inserção falharia com erro 42501.
        // Nesse caso, o perfil será criado na primeira vez que o usuário fizer login (via fetchUserProfile/upsert logic se implementado) ou via Trigger no banco.
        if (data.user && data.session) {
             const { error: profileError } = await supabase
                .from('users')
                .insert([
                    { 
                        id: data.user.id, 
                        name: name, 
                        email: email,
                        role: null 
                    }
                ]);
            
            if (profileError) {
                console.error("Aviso: Perfil base não criado imediatamente (pode requerer confirmação de email ou trigger):", profileError.message);
            }
        }
    };

    const resetPassword = useCallback(async (email: string) => {
        setAuthError(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        if (error) {
            const msg = handleSupabaseError(error);
            setAuthError(msg);
            throw new Error(msg);
        }
    }, []);

    const signInWithGoogle = async () => {
        setAuthError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            const msg = handleSupabaseError(error);
            setAuthError(msg);
            throw new Error(msg);
        }
    };

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAuthState('unauthenticated');
    }, []);

    const updateUser = useCallback(async (updatedData: Partial<User>) => {
        if (!user) return;

        const payload: any = {};
        if (updatedData.name !== undefined) payload.name = updatedData.name;
        if (updatedData.series !== undefined) payload.series = updatedData.series;
        if (updatedData.avatarUrl !== undefined) payload.avatar_url = updatedData.avatarUrl;

        const { error } = await supabase
            .from('users')
            .update(payload)
            .eq('id', user.id);

        if (error) {
            console.error("Erro ao atualizar usuário:", error);
            throw new Error(error.message);
        }

        setUser(prev => prev ? { ...prev, ...updatedData } : null);
    }, [user]);

    const createUserProfile = useCallback(async (role: Role, series?: string) => {
        if (!session?.user) {
            throw new Error("Sessão inválida.");
        }

        const updates: any = {
            id: session.user.id,
            role: role,
            name: user?.name || session.user.user_metadata.full_name || session.user.email,
            email: session.user.email,
            updated_at: new Date().toISOString(),
        };

        if (series) {
            updates.series = series;
        }

        const { error } = await supabase
            .from('users')
            .upsert(updates);

        if (error) {
            console.error("Erro SQL ao criar perfil:", error);
            throw new Error(error.message);
        }

        const appUser: User = {
            id: session.user.id,
            name: updates.name,
            email: updates.email,
            role: role,
            series: series,
        };
        setUser(appUser);
    }, [session, user?.name]);

    const value: AuthContextType = { 
        authState, 
        user, 
        userRole: user?.role ?? null, 
        authError,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        handleLogout,
        updateUser,
        createUserProfile,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
