'use client';

import { getSupabaseClient } from '@/app/auth/supabase';
import getSwarmSupabase from '@/app/utils/SwarmSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

const NeuroSwarmPage = () => {
  const supabase = getSupabaseClient();
  const swarmSupabase: SupabaseClient = getSwarmSupabase();
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState('free');
  const [linked, setLinked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasSwarmAccount, setHasSwarmAccount] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useDifferentEmail, setUseDifferentEmail] = useState(false);
  const [swarmEmail, setSwarmEmail] = useState('');
  const [existingSwarmEmail, setExistingSwarmEmail] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setSwarmEmail(user.email || '');

        // Get user's plan from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        
        if (profileData?.plan) {
          setUserPlan(profileData.plan);
          console.log(`User plan found: ${profileData.plan}`);
        } else {
          console.log('No user plan found, using default: free');
          if (profileError) console.error('Error fetching profile:', profileError);
        }

        // Check if user is already linked in unified_users table
        const { data, error } = await supabase
          .from('unified_users')
          .select('*')
          .eq('app_user_email', user.email)
          .single();

        setLinked(!!data);
        if (data) {
          console.log('User is already linked with Swarm');
        } else {
          console.log('User is not linked with Swarm');
          if (error) console.error('Error checking link status:', error);
        }
      }
    };
    init();
  }, []);

  const handleConnect = () => {
    // Reset all states when opening the dialog
    setHasSwarmAccount(null);
    setUseDifferentEmail(false);
    setError('');
    setExistingSwarmEmail('');
    setSwarmEmail(user?.email || '');
    setPassword('');
    setUsername('');
    setIsDialogOpen(true);
  };

  const checkExistingSwarmAccount = async (email: string) => {
    if (!email) return;
    
    setLoading(true);
    console.log(`Checking if email exists in Swarm: ${email}`);
    try {
      // Check if email exists in Swarm's user_profiles
      const { data, error } = await swarmSupabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      const exists = !!data;
      setHasSwarmAccount(exists);
      
      if (exists) {
        console.log('Swarm account found for email:', email);
      } else {
        console.log('No Swarm account found for email:', email);
        if (error) console.error('Error checking Swarm account:', error);
      }
      
      return exists;
    } catch (error) {
      console.error("Error checking Swarm account:", error);
      setHasSwarmAccount(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleYes = async () => {
    // User has existing Swarm account - just link the accounts
    setLoading(true);
    setError('');
    
    try {
      const emailToCheck = useDifferentEmail ? existingSwarmEmail : user.email;
      
      if (useDifferentEmail && !existingSwarmEmail) {
        throw new Error("Please enter your existing Swarm email");
      }
      
      // Verify the account exists
      const exists = await checkExistingSwarmAccount(emailToCheck);
      if (!exists) {
        throw new Error("Couldn't find Swarm account with this email");
      }
      
      // Get the Swarm user ID
      const { data: swarmUser } = await swarmSupabase
        .from('user_profiles')
        .select('id')
        .eq('email', emailToCheck)
        .single();
      
      if (!swarmUser) {
        throw new Error("Couldn't find Swarm account with this email");
      }
      
      console.log(`Found Swarm user ID: ${swarmUser.id} for email: ${emailToCheck}`);
      
      // Link accounts in unified_users table
      const { error } = await supabase.from('unified_users').insert({
        app_user_id: user.id,
        app_user_email: user.email,
        swarm_user_email: emailToCheck,
        swarm_user_id: swarmUser.id,
        plan: userPlan
      });

      const { error: updateError } = await swarmSupabase.from('user_profiles').update({
        plan: userPlan
      }).eq('email', emailToCheck);

      if (updateError) throw updateError;
      
      if (error) throw error;
      
      console.log('Successfully linked accounts in unified_users table');
      setLinked(true);
      setIsDialogOpen(false);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to link accounts";
      console.error('Error linking accounts:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const createSwarmAccount = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!password || !username) {
        throw new Error("Username and password are required");
      }
      
      if (useDifferentEmail && !swarmEmail) {
        throw new Error("Please enter an email for your Swarm account");
      }
      
      const emailToUse = useDifferentEmail ? swarmEmail : user.email;
      
      // Check if account already exists
      const exists = await checkExistingSwarmAccount(emailToUse);
      if (exists) {
        throw new Error(`An account with email ${emailToUse} already exists in Swarm`);
      }
      
      console.log(`Creating new Swarm account with email: ${emailToUse}`);
      
      // 1. Create Swarm auth account
      const { data, error } = await swarmSupabase.auth.signUp({
        email: emailToUse,
        password,
        options: {
          data: {
            username,
          },
        }
      });
      
      if (error) throw error;
      if (!data.user) throw new Error("No user data returned");
      
      console.log(`Created Swarm auth account with ID: ${data.user.id}`);
      
      // 2. Create user profile in Swarm
      const { data: newUser, error: insertError } = await swarmSupabase
        .from('user_profiles')
        .insert({ email: emailToUse, user_name: username, plan: userPlan })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      console.log(`Created Swarm user profile for email: ${emailToUse}`);
      
      // 3. Link accounts in unified_users table
      const { error: linkError } = await supabase.from('unified_users').insert({
        app_user_id: user.id,
        app_user_email: user.email,
        swarm_user_email: emailToUse,
        swarm_user_id: data.user.id,
        plan: userPlan
      });
      
      if (linkError) throw linkError;
      
      console.log('Successfully linked accounts in unified_users table');
      setLinked(true);
      setIsDialogOpen(false);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to create Swarm account";
      console.error('Error creating Swarm account:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">NeuroSwarm</h1>
      <div className="bg-white/5 rounded-lg p-6">
        <p className="text-xl mb-4">Welcome to NeuroSwarm</p>
        <p className="text-gray-400 mb-10">
          NeuroSwarm is a platform for earning NLOV through GPU power.
        </p>
        {!linked ? (
          <>
            <p className="mb-4">First connect this account with Swarm:</p>
            <Button onClick={handleConnect}>Connect with Swarm</Button>
          </>
        ) : (
          <>
            <p className="mb-4">Your account is connected to Swarm.</p>
            <Button onClick={() => window.location.href = 'http://localhost:8080'}>Switch to NeuroSwarm</Button>
          </>
        )}
      </div>

      {/* Connection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
        }
        // Don't reset state here, we do it in handleConnect
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect with Swarm</DialogTitle>
          </DialogHeader>
          
          {hasSwarmAccount === null && (
            <>
              <p>Do you already have a Swarm account?</p>
              <DialogFooter className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setHasSwarmAccount(false)}>No</Button>
                <Button onClick={() => {
                  // When user says Yes, just set hasSwarmAccount to true
                  // Don't check email yet, wait for user to confirm which email to use
                  setHasSwarmAccount(true);
                }}>Yes</Button>
              </DialogFooter>
            </>
          )}

          {hasSwarmAccount === true && (
            <>
              <p>We'll connect your existing Swarm account to this app.</p>
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="use-different-email" 
                  checked={useDifferentEmail}
                  onCheckedChange={(checked) => setUseDifferentEmail(checked === true)}
                />
                <Label htmlFor="use-different-email">Use a different email for Swarm</Label>
              </div>
              
              {useDifferentEmail && (
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="swarm-existing-email">Your Swarm Email</Label>
                  <Input 
                    id="swarm-existing-email" 
                    type="email" 
                    value={existingSwarmEmail} 
                    onChange={(e) => setExistingSwarmEmail(e.target.value)} 
                    placeholder="Enter your Swarm email" 
                  />
                </div>
              )}
              
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <DialogFooter className="mt-4">
                <Button onClick={handleYes} disabled={loading}>
                  {loading ? 'Connecting...' : 'Connect Accounts'}
                </Button>
              </DialogFooter>
            </>
          )}

          {hasSwarmAccount === false && (
            <>
              <p>We'll create a new Swarm account.</p>
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="use-different-email-new" 
                  checked={useDifferentEmail}
                  onCheckedChange={(checked) => setUseDifferentEmail(checked === true)}
                />
                <Label htmlFor="use-different-email-new">Use a different email for Swarm</Label>
              </div>
              
              {useDifferentEmail ? (
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="swarm-email">Swarm Email</Label>
                  <Input 
                    id="swarm-email" 
                    type="email" 
                    value={swarmEmail} 
                    onChange={(e) => setSwarmEmail(e.target.value)} 
                    placeholder="Enter email for Swarm" 
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  Using your current email: {user?.email}
                </p>
              )}
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Enter username" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Create a password" 
                  />
                </div>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <DialogFooter>
                <Button onClick={createSwarmAccount} disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Swarm Account'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NeuroSwarmPage;
