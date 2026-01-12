
import { supabase } from "../components/supabaseClient";
import type { Page } from "../types";

export type NotificationType = 
  | "activity_post" 
  | "activity_submission" 
  | "module_post" 
  | "notice_post" 
  | "activity_correction";

interface CreateNotificationParams {
  userId: string;
  actorId: string;
  actorName: string;
  type: NotificationType;
  title: string;
  text: string;
  classId: string;
  activityId?: string;
  moduleId?: string;
  noticeId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    let deepLink: { page: Page; id?: string } = { page: 'dashboard' };
    let urgency: 'low' | 'medium' | 'high' = 'medium';

    switch (params.type) {
      case 'activity_post':
        deepLink = { page: 'activities' };
        urgency = 'high';
        break;
      case 'activity_submission':
        deepLink = { page: 'teacher_pending_activities' };
        urgency = 'high';
        break;
      case 'module_post':
        deepLink = { page: 'modules', id: params.moduleId };
        urgency = 'medium';
        break;
      case 'notice_post':
        deepLink = { page: 'join_class' };
        urgency = 'medium';
        break;
      case 'activity_correction':
        deepLink = { page: 'student_activity_view', id: params.activityId };
        urgency = 'high';
        break;
    }

    const payload = {
      user_id: params.userId,
      actor_id: params.actorId,
      actor_name: params.actorName,
      type: params.type,
      title: params.title,
      text: params.text,
      summary: params.text,
      deep_link: deepLink,
      urgency,
      read: false,
      group_count: 1
    };

    const { error } = await supabase
        .from('notifications')
        .insert([payload]);

    if (error) throw error;

  } catch (error) {
    console.error("Erro ao criar notificação:", error);
  }
}
