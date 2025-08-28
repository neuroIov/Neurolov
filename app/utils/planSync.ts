import { getSupabaseClient } from '@/app/auth/supabase';
import { getSwarmSupabaseService } from '@/app/utils/SwarmSupabase';

export interface PlanSyncResult {
  success: boolean;
  message: string;
  syncedTo?: 'compute' | 'swarm' | 'both';
}

/**
 * Synchronizes subscription plans between compute and swarm databases
 * @param userId - The compute app user ID
 * @param newPlan - The new plan to sync
 * @param direction - Which direction to sync ('compute-to-swarm', 'swarm-to-compute', or 'both')
 */
export async function syncUserPlan(
  userId: string, 
  newPlan: string, 
  direction: 'compute-to-swarm' | 'swarm-to-compute' | 'both' = 'both'
): Promise<PlanSyncResult> {
  try {
    const supabase = getSupabaseClient();
    const swarmSupabaseService = getSwarmSupabaseService();

    // Get user's unified_users record to find linked accounts
    const { data: unifiedUser, error: unifiedError } = await supabase
      .from('unified_users')
      .select('*')
      .eq('app_user_id', userId)
      .single();

    if (unifiedError || !unifiedUser) {
      console.log('User not linked to swarm, updating compute plan only');
      
      // Update compute database only
      const { error: computeError } = await supabase
        .from('profiles')
        .update({ plan: newPlan, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (computeError) {
        return { success: false, message: 'Failed to update compute plan' };
      }

      return { 
        success: true, 
        message: 'Plan updated in compute database only (user not linked to swarm)',
        syncedTo: 'compute'
      };
    }

    // User is linked - sync based on direction
    let computeSuccess = false;
    let swarmSuccess = false;

    // Update compute database
    if (direction === 'compute-to-swarm' || direction === 'both') {
      const { error: computeError } = await supabase
        .from('profiles')
        .update({ plan: newPlan, updated_at: new Date().toISOString() })
        .eq('id', userId);

      computeSuccess = !computeError;
      if (computeError) {
        console.error('Failed to update compute plan:', computeError);
      }
    }

    // Update swarm database
    if (direction === 'swarm-to-compute' || direction === 'both') {
      if (swarmSupabaseService) {
        const { error: swarmError } = await swarmSupabaseService
          .from('user_profiles')
          .update({ plan: newPlan })
          .eq('email', unifiedUser.swarm_user_email);

        swarmSuccess = !swarmError;
        if (swarmError) {
          console.error('Failed to update swarm plan:', swarmError);
        }
      } else {
        console.warn('Swarm service role not available, cannot update swarm plan');
      }
    }

    // Update unified_users record with new plan
    await supabase
      .from('unified_users')
      .update({ plan: newPlan })
      .eq('app_user_id', userId);

    // Determine result
    if (direction === 'compute-to-swarm') {
      return {
        success: computeSuccess,
        message: computeSuccess ? 'Plan synced to compute database' : 'Failed to update compute plan',
        syncedTo: computeSuccess ? 'compute' : undefined
      };
    }

    if (direction === 'swarm-to-compute') {
      return {
        success: swarmSuccess,
        message: swarmSuccess ? 'Plan synced to swarm database' : 'Failed to update swarm plan',
        syncedTo: swarmSuccess ? 'swarm' : undefined
      };
    }

    // Both direction
    if (computeSuccess && swarmSuccess) {
      return {
        success: true,
        message: 'Plan successfully synced to both databases',
        syncedTo: 'both'
      };
    }

    if (computeSuccess || swarmSuccess) {
      return {
        success: true,
        message: `Plan partially synced (${computeSuccess ? 'compute' : ''}${computeSuccess && swarmSuccess ? ' and ' : ''}${swarmSuccess ? 'swarm' : ''})`,
        syncedTo: computeSuccess ? 'compute' : 'swarm'
      };
    }

    return {
      success: false,
      message: 'Failed to sync plan to any database'
    };

  } catch (error) {
    console.error('Plan sync error:', error);
    return {
      success: false,
      message: `Plan sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Gets the user's current plan from both databases and checks for inconsistencies
 */
export async function checkPlanConsistency(userId: string): Promise<{
  computePlan?: string;
  swarmPlan?: string;
  isConsistent: boolean;
  recommendation?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    const swarmSupabaseService = getSwarmSupabaseService();

    // Get compute plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    // Get unified user record
    const { data: unifiedUser } = await supabase
      .from('unified_users')
      .select('*')
      .eq('app_user_id', userId)
      .single();

    if (!unifiedUser) {
      return {
        computePlan: profile?.plan,
        isConsistent: true,
        recommendation: 'User not linked to swarm'
      };
    }

    // Get swarm plan
    let swarmPlan = null;
    if (swarmSupabaseService) {
      const { data: swarmProfile } = await swarmSupabaseService
        .from('user_profiles')
        .select('plan')
        .eq('email', unifiedUser.swarm_user_email)
        .single();
      swarmPlan = swarmProfile?.plan;
    }

    const computePlan = profile?.plan;
    const isConsistent = computePlan === swarmPlan;

    return {
      computePlan,
      swarmPlan,
      isConsistent,
      recommendation: isConsistent 
        ? 'Plans are in sync' 
        : 'Plans are inconsistent - consider syncing'
    };

  } catch (error) {
    console.error('Plan consistency check error:', error);
    return {
      isConsistent: false,
      recommendation: 'Could not check plan consistency'
    };
  }
}
