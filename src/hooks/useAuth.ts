import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  userRole: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    profile: null,
    userRole: null,
  });

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      setAuthState(prev => ({
        ...prev,
        profile,
        userRole: roleData?.role || null,
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  const logSession = useCallback(async (session: Session | null) => {
    if (!session?.user) return;

    try {
      await supabase.from('user_sessions').insert({
        user_id: session.user.id,
        session_id: session.access_token.substring(0, 20),
        ip_address: null, // Will be handled by server
        user_agent: navigator.userAgent,
        expires_at: new Date(session.expires_at! * 1000).toISOString(),
      });
    } catch (error) {
      console.error('Error logging session:', error);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));

        // Fetch additional user data when logged in
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            if (event === 'SIGNED_IN') {
              logSession(session);
            }
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            userRole: null,
          }));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));

      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, logSession]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: metadata,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    // Update session as logged out
    if (authState.session) {
      try {
        await supabase
          .from('user_sessions')
          .update({ 
            logout_at: new Date().toISOString(),
            is_active: false 
          })
          .eq('session_id', authState.session.access_token.substring(0, 20));
      } catch (error) {
        console.error('Error updating session logout:', error);
      }
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const hasRole = (role: string): boolean => {
    return authState.userRole === role;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isInvestigator = (): boolean => hasRole('investigator');
  const isAnalyst = (): boolean => hasRole('analyst');

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    hasRole,
    isAdmin,
    isInvestigator,
    isAnalyst,
  };
};