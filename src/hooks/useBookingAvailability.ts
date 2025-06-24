
import { useState, useEffect } from 'react';
import { getDayAvailability } from '@/utils/supabaseStorage';
import { DayAvailability } from '@/types/booking';

export const useBookingAvailability = (date: Date) => {
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      try {
        const data = await getDayAvailability(date);
        setAvailability(data);
      } catch (error) {
        console.error('Error loading availability:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [date]);

  return { availability, loading };
};
