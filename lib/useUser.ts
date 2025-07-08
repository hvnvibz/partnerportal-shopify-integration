"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
    if (data.session?.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', data.session.user.id)
        .single();
      setProfile(profileData ?? null);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data ?? null));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Initial check
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data }) => setProfile(data ?? null));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading, refreshUser };
} 