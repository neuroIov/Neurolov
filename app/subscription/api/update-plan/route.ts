import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { plan } = await request.json();

        if (!plan) {
            return NextResponse.json(
                { error: 'Invalid plan. Please provide a valid plan.' },
                { status: 400 }
            );
        }

        // Create a Supabase client
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('Error fetching user:', userError);
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Update the user's plan in the profiles table
        const { data, error } = await supabase
            .from('profiles')
            .update({ plan: plan.toLowerCase() })
            .eq('id', user.id)
            .select();

        if (error) {
            console.error('Error updating user plan:', error);
            return NextResponse.json(
                { error: 'Failed to update subscription plan' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription plan updated successfully',
            plan: plan.toLowerCase()
        });
    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 