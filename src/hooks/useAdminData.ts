
import { useState, useCallback } from 'react';
import { Booking, DayAvailability } from '@/types/booking';
import { getBookings, getDayAvailability, getDaySettings } from '@/utils/supabaseStorage';
import { getRestaurantDates } from '@/utils/dateUtils';

interface AdminDataState {
  bookings: Booking[];
  availabilities: Record<string, DayAvailability>;
  daySettings: Record<string, { maxSeats: number; isSoldOut: boolean }>;
  loading: boolean;
  initialized: boolean;
}

export const useAdminData = () => {
  const [state, setState] = useState<AdminDataState>({
    bookings: [],
    availabilities: {},
    daySettings: {},
    loading: false,
    initialized: false
  });

  const loadAllData = useCallback(async () => {
    console.log('Loading admin data...');
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const restaurantDates = getRestaurantDates();
      console.log('Restaurant dates:', restaurantDates.length);
      
      // Load all data in parallel
      const [bookings, daySettings] = await Promise.all([
        getBookings(),
        getDaySettings()
      ]);

      console.log('Loaded bookings:', bookings.length);
      console.log('Loaded day settings:', Object.keys(daySettings).length);

      // Load availabilities for all dates
      const availabilitiesData: Record<string, DayAvailability> = {};
      for (const date of restaurantDates) {
        const availability = await getDayAvailability(date);
        availabilitiesData[availability.date] = availability;
      }

      console.log('Loaded availabilities:', Object.keys(availabilitiesData).length);

      setState({
        bookings,
        availabilities: availabilitiesData,
        daySettings,
        loading: false,
        initialized: true
      });

      console.log('Admin data loaded successfully');
    } catch (error) {
      console.error('Error loading admin data:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        initialized: true // Set to true even on error to prevent infinite loading
      }));
    }
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    setState(prev => ({
      ...prev,
      bookings: [booking, ...prev.bookings]
    }));
  }, []);

  const removeBooking = useCallback((code: string) => {
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.filter(b => b.code !== code)
    }));
  }, []);

  const updateDaySettingsLocal = useCallback((date: string, settings: { maxSeats?: number; isSoldOut?: boolean }) => {
    setState(prev => ({
      ...prev,
      daySettings: {
        ...prev.daySettings,
        [date]: {
          ...prev.daySettings[date],
          ...settings
        }
      }
    }));
  }, []);

  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  return {
    ...state,
    loadAllData,
    addBooking,
    removeBooking,
    updateDaySettingsLocal,
    refreshData
  };
};
