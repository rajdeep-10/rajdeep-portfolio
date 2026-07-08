import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";

/**
 * Replaces the old localStorage pattern:
 *   const [x, setX] = useState(() => JSON.parse(localStorage.getItem(key)) ?? fallback)
 *
 * Usage:
 *   const { value, setValue, loading } = useSiteContent("thm_stats", fallbackObj);
 *   ...
 *   await setValue(newObj) // writes to Supabase, updates everywhere on next load/subscription
 *
 * Table required (see supabase_schema.sql):
 *   site_content (key text primary key, value jsonb, updated_at timestamptz)
 */
export function useSiteContent(key, fallback) {
  const [value, setValueState] = useState(fallback);
  const [loading, setLoading] = useState(true);

  const fetchValue = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (!error && data) {
      setValueState(data.value);
    }
    setLoading(false);
  }, [key]);

  useEffect(() => {
    fetchValue();

    // live updates: if you edit on one device/tab, all open visitor tabs update too
    const channel = supabase
      .channel(`site_content_${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content", filter: `key=eq.${key}` },
        (payload) => {
          if (payload.new?.value !== undefined) {
            setValueState(payload.new.value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [key, fetchValue]);

  const setValue = async (newValue) => {
    setValueState(newValue); // optimistic update
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value: newValue, updated_at: new Date().toISOString() });
    if (error) {
      console.error(`Failed to save ${key}:`, error.message);
      alert(`Failed to save changes: ${error.message}`);
    }
  };

  return { value, setValue, loading };
}
