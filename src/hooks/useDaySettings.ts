
import { useState, useEffect } from 'react';
import { getDaySettings } from '@/utils/supabaseStorage';
import { supabase } from '@/integrations/supabase/client';

export const useDaySettings = () => {
  const [daySettings, setDaySettings] = useState<Record<string, { maxSeats: number; isSoldOut: boolean }>>({});
  const [loading, setLoading] = useState(true);

  const loadDaySettings = async () => {
    setLoading(true);
    const data = await getDaySettings();
    setDaySettings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDaySettings();

    // Set up real-time subscription
    const channel = supabase
      .channel('day-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'day_settings'
        },
        () => {
          // Reload day settings when any change occurs
          loadDaySettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { daySettings, loading, refetch: loadDaySettings };
};
