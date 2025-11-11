"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
      
      setProfile(profileData ?? null);
      setRole(profileData?.role ?? null);
      setStatus(profileData?.status ?? null);
      
      // Debug logging
      if (profileData) {
        console.log('Profile loaded:', {
          hasRole: !!profileData.role,
          hasStatus: !!profileData.status,
          role: profileData.role,
          status: profileData.status
        });
      }
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
            }
            setProfile(data ?? null);
            setRole(data?.role ?? null);
            setStatus(data?.status ?? null);
            
            // Debug logging
            if (data) {
              console.log('Profile loaded (auth state change):', {
                hasRole: !!data.role,
                hasStatus: !!data.status,
                role: data.role,
                status: data.status
              });
            }
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
            }
            setProfile(data ?? null);
            setRole(data?.role ?? null);
            setStatus(data?.status ?? null);
            
            // Debug logging
            if (data) {
              console.log('Profile loaded (initial check):', {
                hasRole: !!data.role,
                hasStatus: !!data.status,
                role: data.role,
                status: data.status
              });
            }
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
    };
  }, []);

  return { user, profile, role, status, loading, refreshUser };
} 