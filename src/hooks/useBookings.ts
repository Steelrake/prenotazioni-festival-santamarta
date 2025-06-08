
import { useState, useEffect } from 'react';
import { Booking } from '@/types/booking';
import { getBookings } from '@/utils/supabaseStorage';
import { supabase } from '@/integrations/supabase/client';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    const data = await getBookings();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();

    // Set up real-time subscription
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          // Reload bookings when any change occurs
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { bookings, loading, refetch: loadBookings };
};
