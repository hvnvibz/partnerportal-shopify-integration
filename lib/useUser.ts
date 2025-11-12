"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityUpdateRef = useRef<number>(0);

  // Function to update user activity
  async function updateActivity() {
    const now = Date.now();
    // Only update if more than 1 minute has passed since last update
    if (now - lastActivityUpdateRef.current < 60000) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;

      const response = await fetch('/api/activity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        lastActivityUpdateRef.current = now;
      }
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }

  async function refreshUser() {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
    if (data.session?.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, role, status')
        .eq('id', data.session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error loading profile in useUser:', profileError);
        console.error('Error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
      }
      
      setProfile(profileData ?? null);
      setRole(profileData?.role ?? null);
      // Normalize status to lowercase and trim (consistent with login route)
      const normalizedStatus = profileData?.status?.toLowerCase()?.trim() || null;
      setStatus(normalizedStatus);
      
      // Debug logging
      console.log('Profile loaded in refreshUser:', {
        hasData: !!profileData,
        hasRole: !!profileData?.role,
        hasStatus: !!profileData?.status,
        role: profileData?.role,
        status: profileData?.status,
        normalizedStatus: normalizedStatus,
        fullProfile: profileData
      });
    } else {
      setProfile(null);
      setRole(null);
      setStatus(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('display_name, avatar_url, role, status')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error loading profile in auth state change:', error);
              console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
              });
            }
            setProfile(data ?? null);
            setRole(data?.role ?? null);
            // Normalize status to lowercase and trim (consistent with login route)
            const normalizedStatus = data?.status?.toLowerCase()?.trim() || null;
            setStatus(normalizedStatus);
            
            // Debug logging
            console.log('Profile loaded (auth state change):', {
              hasData: !!data,
              hasRole: !!data?.role,
              hasStatus: !!data?.status,
              role: data?.role,
              status: data?.status,
              normalizedStatus: normalizedStatus,
              fullProfile: data
            });
          });
      } else {
        setProfile(null);
        setRole(null);
        setStatus(null);
      }
      setLoading(false);
    });

    // Initial check
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        supabase
          .from('profiles')
          .select('display_name, avatar_url, role, status')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error loading profile in initial check:', error);
              console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
              });
            }
            setProfile(data ?? null);
            setRole(data?.role ?? null);
            // Normalize status to lowercase and trim (consistent with login route)
            const normalizedStatus = data?.status?.toLowerCase()?.trim() || null;
            setStatus(normalizedStatus);
            
            // Debug logging
            console.log('Profile loaded (initial check):', {
              hasData: !!data,
              hasRole: !!data?.role,
              hasStatus: !!data?.status,
              role: data?.role,
              status: data?.status,
              normalizedStatus: normalizedStatus,
              fullProfile: data
            });
          });
      } else {
        setProfile(null);
        setRole(null);
        setStatus(null);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };
  }, []);

  // Set up activity tracking when user is logged in
  useEffect(() => {
    // Clear existing interval
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
      activityIntervalRef.current = null;
    }

    if (user && !loading) {
      // Update activity immediately when user is loaded
      updateActivity();
      
      // Then update every 2 minutes
      activityIntervalRef.current = setInterval(() => {
        updateActivity();
      }, 120000); // 2 minutes
    }

    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };
  }, [user, loading]);

  return { user, profile, role, status, loading, refreshUser };
} 