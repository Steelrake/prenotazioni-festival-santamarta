
import { Booking, DayAvailability } from '@/types/booking';
import { formatDate } from './dateUtils';

const BOOKINGS_KEY = 'restaurant_bookings';
const SETTINGS_KEY = 'restaurant_settings';

export const getBookings = (): Booking[] => {
  const stored = localStorage.getItem(BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveBooking = (booking: Booking): void => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const deleteBooking = (code: string): boolean => {
  const bookings = getBookings();
  const index = bookings.findIndex(booking => booking.code === code);
  if (index !== -1) {
    bookings.splice(index, 1);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return true;
  }
  return false;
};

export const getBookingByCode = (code: string): Booking | null => {
  const bookings = getBookings();
  return bookings.find(booking => booking.code === code) || null;
};

export const getBookingsByDate = (date: string): Booking[] => {
  const bookings = getBookings();
  return bookings.filter(booking => booking.date === date);
};

export const getDaySettings = (): Record<string, { maxSeats: number; isSoldOut: boolean }> => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const updateDaySettings = (date: string, settings: { maxSeats?: number; isSoldOut?: boolean }): void => {
  const daySettings = getDaySettings();
  if (!daySettings[date]) {
    daySettings[date] = { maxSeats: 100, isSoldOut: false };
  }
  if (settings.maxSeats !== undefined) {
    daySettings[date].maxSeats = settings.maxSeats;
  }
  if (settings.isSoldOut !== undefined) {
    daySettings[date].isSoldOut = settings.isSoldOut;
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(daySettings));
};

export const getDayAvailability = (date: Date): DayAvailability => {
  const dateStr = formatDate(date);
  const bookings = getBookingsByDate(dateStr);
  const daySettings = getDaySettings();
  const settings = daySettings[dateStr] || { maxSeats: 100, isSoldOut: false };
  
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

export const resetDay = (date: string): void => {
  const bookings = getBookings();
  const filtered = bookings.filter(booking => booking.date !== date);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
  
  updateDaySettings(date, { isSoldOut: false });
};
