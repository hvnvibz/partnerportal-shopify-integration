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
    };
  }, []);

  return { user, profile, role, status, loading, refreshUser };
} 