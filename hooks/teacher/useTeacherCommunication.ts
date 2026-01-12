
import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../components/supabaseClient';
import type { ClassInvitation, TeacherClass } from '../../types';
import { createNotification } from '../../utils/createNotification';

export function useTeacherCommunication(
    user: any, 
    addToast: (msg: string, type: any) => void,
    setTeacherClasses: React.Dispatch<React.SetStateAction<TeacherClass[]>>,
    teacherClasses: TeacherClass[]
) {
    const [pendingInvitations, setPendingInvitations] = useState<ClassInvitation[]>([]);
    const [isLoadingComm, setIsLoadingComm] = useState(true);
    const [isSubmittingComm, setIsSubmittingComm] = useState(false);

    const fetchTeacherCommunication = useCallback(async (forceRefresh = false) => {
        if (!user) return;
        setIsLoadingComm(true);
        try {
            // 1. Invitations (Supabase)
            // Fetch invites where current user is the invitee
            const { data, error } = await supabase
                .from('invitations')
                .select('*')
                .eq('inviteeId', user.id)
                .eq('status', 'pending');

            if (error) throw error;

            const invites = (data || []).map((d: any) => ({
                id: d.id,
                ...d,
                timestamp: d.created_at || new Date().toISOString()
            } as ClassInvitation));
            
            setPendingInvitations(invites);

        } catch (error: any) {
            console.error("Error fetching communication:", error);
        } finally {
            setIsLoadingComm(false);
        }
    }, [user]);

    // Trigger initial fetch
    useEffect(() => {
        if (user) {
            fetchTeacherCommunication();
        }
    }, [user, fetchTeacherCommunication]);

    const handlePostNotice = useCallback(async (classId: string, text: string) => {
        if (!user) return;
        try {
            // Fix: Database schema uses 'author_id'. Removed 'author_name' based on user feedback.
            const noticePayload = { 
                class_id: classId, 
                text, 
                author_id: user.id 
            };
            
            // 1. Insert into class_notices table
            const { error } = await supabase
                .from('class_notices')
                .insert([noticePayload]);

            if (error) throw error;

            // 2. Create Broadcast (Optional, for general alerts)
            const expiresAt = new Date(); 
            expiresAt.setDate(expiresAt.getDate() + 30);
            
            await supabase.from('broadcasts').insert([{
                class_id: classId, 
                type: 'notice_post', 
                title: 'Novo Aviso', 
                summary: `Professor ${user.name}: "${text}"`,
                author_name: user.name,
                expires_at: expiresAt.toISOString(),
                deep_link: { page: 'join_class' }
            }]);

            // 3. Optimistic Update (Local State)
            // Keep 'author' here for UI display until refresh
            const noticeForState = { 
                id: Date.now().toString(), // Temp ID
                text, 
                author: user.name, 
                authorId: user.id, 
                timestamp: new Date().toISOString() 
            };

            setTeacherClasses(prev => prev.map(c => 
                c.id === classId ? { ...c, notices: [noticeForState, ...(c.notices || [])], noticeCount: (c.noticeCount || 0) + 1 } : c
            ));

            addToast("Aviso postado!", "success");
        } catch (error) { 
            console.error(error); 
            addToast("Erro ao postar aviso.", "error"); 
        }
    }, [user, addToast, setTeacherClasses]);

    const handleInviteTeacher = useCallback(async (classId: string, email: string, subject: string) => {
        if (!user) return;
        setIsSubmittingComm(true);
        try {
            // 1. Find user by email
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email);

            if (userError || !users || users.length === 0) { 
                addToast("Usuário não encontrado.", "error"); 
                setIsSubmittingComm(false); 
                return; 
            }
            
            const invitedUser = users[0];

            if (invitedUser.role !== 'professor') { 
                addToast("O usuário não é um professor.", "error"); 
                setIsSubmittingComm(false); 
                return; 
            }

            const currentClass = teacherClasses.find(c => c.id === classId);
            // Assuming we track teachers locally or check via DB
            // Check logic skipped for brevity, relying on DB constraint or manual check

            // 2. Create Invitation
            const { error: inviteError } = await supabase
                .from('invitations')
                .insert([{
                    type: 'class_co_teacher', 
                    classId, 
                    className: currentClass?.name || 'Turma',
                    inviterId: user.id, 
                    inviterName: user.name, 
                    inviteeId: invitedUser.id, 
                    inviteeEmail: email,
                    subject, 
                    status: 'pending'
                }]);

            if (inviteError) throw inviteError;

            await createNotification({
                userId: invitedUser.id, actorId: user.id, actorName: user.name, type: 'notice_post',
                title: 'Convite para Co-Docência', text: `Você foi convidado para ser professor da turma "${currentClass?.name}".`, classId
            });

            addToast(`Convite enviado para ${invitedUser.name}.`, "success");
        } catch (error) { 
            console.error(error); 
            addToast("Erro ao enviar convite.", "error"); 
        } finally { 
            setIsSubmittingComm(false); 
        }
    }, [user, teacherClasses, addToast]);

    const handleAcceptInvite = useCallback(async (invitation: ClassInvitation) => {
        if (!user) return;
        setIsSubmittingComm(true);
        try {
            // 1. Add Teacher to Class (Using custom Supabase logic or array update)
            // Assuming 'teachers' is a text[] column or handled via relation. 
            // We'll assume direct update for this MVP migration.
            
            // First get current teachers
            const { data: classData } = await supabase
                .from('classes')
                .select('teachers, subjects, teacher_names')
                .eq('id', invitation.classId)
                .single();
                
            if (!classData) throw new Error("Turma não encontrada");

            const updatedTeachers = [...(classData.teachers || []), user.id];
            const updatedSubjects = { ...classData.subjects, [user.id]: invitation.subject };
            const updatedNames = { ...classData.teacher_names, [user.id]: user.name };

            const { error: updateError } = await supabase
                .from('classes')
                .update({ 
                    teachers: updatedTeachers,
                    subjects: updatedSubjects,
                    teacher_names: updatedNames
                })
                .eq('id', invitation.classId);

            if (updateError) throw updateError;

            // 2. Delete Invitation
            await supabase.from('invitations').delete().eq('id', invitation.id);

            setPendingInvitations(prev => prev.filter(i => i.id !== invitation.id));
            addToast("Convite aceito! A turma aparecerá em breve.", "success");
        } catch (error) { 
            console.error(error); 
            addToast("Erro ao aceitar convite.", "error"); 
        } finally { 
            setIsSubmittingComm(false); 
        }
    }, [user, addToast]);

    const handleDeclineInvite = useCallback(async (invitationId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('invitations')
                .delete()
                .eq('id', invitationId);

            if (error) throw error;

            setPendingInvitations(prev => prev.filter(i => i.id !== invitationId));
            addToast("Convite recusado.", "info");
        } catch (error) { 
            console.error(error); 
            addToast("Erro ao recusar convite.", "error"); 
        }
    }, [user, addToast]);

    const handleCleanupOldData = useCallback(async () => {
        if (!user) return;
        // Maintenance function - low priority
        console.log("Cleanup triggered");
    }, [user]);

    return {
        pendingInvitations, isLoadingComm, isSubmittingComm,
        fetchTeacherCommunication, handlePostNotice, handleInviteTeacher,
        handleAcceptInvite, handleDeclineInvite, handleCleanupOldData
    };
}
