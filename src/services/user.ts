/**
 * User Service
 */

import { supabase, createLogger } from '@/lib';
import type { ServiceResult } from './types';

const log = createLogger('UserService');

/**
 * Look up a user ID by email (for sharing)
 */
export async function getUserIdByEmail(email: string): Promise<ServiceResult<string>> {
  try {
    const { data, error } = await supabase.rpc('get_user_id_by_email', { 
      email_input: email.trim().toLowerCase() 
    });

    if (error) {
      log.error('Get user by email error', { error: error.message });
      return { data: null, error: error.message };
    }

    log.debug('User lookup successful', { email: email.substring(0, 3) + '***' });
    return { data: data as string, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('Get user by email exception', { error: message });
    return { data: null, error: 'Failed to find user' };
  }
}

export interface InviteCollaboratorResult {
  userId: string | null;
  email: string;
  isNewUser: boolean;
}

/**
 * Invite a collaborator to a journey
 * - If user exists: returns their user_id
 * - If user doesn't exist: sends invite email and returns email for pending storage
 */
export async function inviteCollaborator(
  email: string,
  journeyName: string,
  inviterName?: string
): Promise<ServiceResult<InviteCollaboratorResult>> {
  try {
    const { data, error } = await supabase.functions.invoke('invite-collaborator', {
      body: {
        email: email.trim().toLowerCase(),
        journeyName,
        inviterName,
      },
    });

    if (error) {
      log.error('Invite collaborator error', { error: error.message });
      return { data: null, error: error.message };
    }

    if (data.error) {
      log.error('Invite collaborator returned error', { error: data.error });
      return { data: null, error: data.error };
    }

    log.debug('Collaborator invite processed', { 
      email: email.substring(0, 3) + '***',
      isNewUser: data.isNewUser,
    });

    return {
      data: {
        userId: data.userId,
        email: data.email,
        isNewUser: data.isNewUser,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('Invite collaborator exception', { error: message });
    return { data: null, error: 'Failed to invite collaborator' };
  }
}

/**
 * Export all user data (journeys and memories)
 */
export async function exportUserData(userId: string): Promise<ServiceResult<{
  journeys: unknown[];
  memories: unknown[];
  exportedAt: string;
}>> {
  try {
    // Fetch all journeys
    const { data: journeys, error: journeysError } = await supabase
      .from('journeys')
      .select('*')
      .or(`user_id.eq.${userId},shared_with.cs.{${userId}}`);

    if (journeysError) {
      log.error('Export journeys error', { error: journeysError.message });
      return { data: null, error: journeysError.message };
    }

    // Fetch all memories for those journeys
    let memories: unknown[] = [];
    if (journeys && journeys.length > 0) {
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('memories')
        .select('*')
        .in('journey_id', journeys.map(j => j.id));

      if (memoriesError) {
        log.error('Export memories error', { error: memoriesError.message });
        return { data: null, error: memoriesError.message };
      }

      memories = memoriesData || [];
    }

    log.info('Data exported', {
      userId,
      journeyCount: journeys?.length || 0,
      memoryCount: memories.length,
    });

    return {
      data: {
        journeys: journeys || [],
        memories,
        exportedAt: new Date().toISOString(),
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('Export exception', { error: message });
    return { data: null, error: 'Failed to export data' };
  }
}

/**
 * Delete all user data and account
 */
export async function deleteUserAccount(userId: string): Promise<ServiceResult<boolean>> {
  try {
    // Delete all memories for user's journeys first
    const { data: journeys } = await supabase
      .from('journeys')
      .select('id')
      .eq('user_id', userId);

    if (journeys && journeys.length > 0) {
      const journeyIds = journeys.map(j => j.id);
      
      // Delete memories
      await supabase
        .from('memories')
        .delete()
        .in('journey_id', journeyIds);

      // Delete journeys
      await supabase
        .from('journeys')
        .delete()
        .eq('user_id', userId);
    }

    // Sign out (account deletion would typically require server-side admin API)
    await supabase.auth.signOut();

    log.info('Account deleted', { userId });
    return { data: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('Delete account exception', { error: message, userId });
    return { data: null, error: 'Failed to delete account' };
  }
}
