
import { supabase } from '@/integrations/supabase/client';
import { Booking, DayAvailability } from '@/types/booking';
import { formatDate } from './dateUtils';

export const getBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  
  return data || [];
};

export const saveBooking = async (booking: Booking): Promise<boolean> => {
  const { error } = await supabase
    .from('bookings')
    .insert([booking]);
  
  if (error) {
    console.error('Error saving booking:', error);
    return false;
  }
  
  return true;
};

export const deleteBooking = async (code: string): Promise<boolean> => {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('code', code);
  
  if (error) {
    console.error('Error deleting booking:', error);
    return false;
  }
  
  return true;
};

export const getBookingByCode = async (code: string): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('code', code)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching booking by code:', error);
    return null;
  }
  
  return data;
};

export const getBookingsByDate = async (date: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', date);
  
  if (error) {
    console.error('Error fetching bookings by date:', error);
    return [];
  }
  
  return data || [];
};

export const getDaySettings = async (): Promise<Record<string, { maxSeats: number; isSoldOut: boolean }>> => {
  const { data, error } = await supabase
    .from('day_settings')
    .select('*');
  
  if (error) {
    console.error('Error fetching day settings:', error);
    return {};
  }
  
  const settings: Record<string, { maxSeats: number; isSoldOut: boolean }> = {};
  data?.forEach((setting) => {
    settings[setting.date] = {
      maxSeats: setting.max_seats,
      isSoldOut: setting.is_sold_out
    };
  });
  
  return settings;
};

export const updateDaySettings = async (date: string, settings: { maxSeats?: number; isSoldOut?: boolean }): Promise<void> => {
  const updateData: any = { updated_at: new Date().toISOString() };
  
  if (settings.maxSeats !== undefined) {
    updateData.max_seats = settings.maxSeats;
  }
  if (settings.isSoldOut !== undefined) {
    updateData.is_sold_out = settings.isSoldOut;
  }
  
  const { error } = await supabase
    .from('day_settings')
    .upsert([{ date, ...updateData }]);
  
  if (error) {
    console.error('Error updating day settings:', error);
  }
};

export const getDayAvailability = async (date: Date): Promise<DayAvailability> => {
  const dateStr = formatDate(date);
  
  // Fetch bookings and settings in parallel
  const [bookings, daySettings] = await Promise.all([
    getBookingsByDate(dateStr),
    getDaySettings()
  ]);
  
  const settings = daySettings[dateStr] || { maxSeats: 150, isSoldOut: false };
  const bookedSeats = bookings.reduce((total, booking) => total + booking.seats, 0);
  const availableSeats = Math.max(0, settings.maxSeats - bookedSeats);
  
  return {
    date: dateStr,
    totalSeats: settings.maxSeats,
    bookedSeats,
    availableSeats,
    isSoldOut: settings.isSoldOut || availableSeats === 0
  };
};

export const resetDay = async (date: string): Promise<void> => {
  // Delete all bookings for the date
  const { error: bookingsError } = await supabase
    .from('bookings')
    .delete()
    .eq('date', date);
  
  if (bookingsError) {
    console.error('Error deleting bookings for reset:', bookingsError);
  }
  
  // Reset day settings
  await updateDaySettings(date, { isSoldOut: false });
};
