
export const getRestaurantDates = () => {
  const startDate = new Date('2025-06-30');
  const endDate = new Date('2025-07-27');
  const dates: Date[] = [];
  
  const current = new Date(startDate);
  
  while (current <= endDate) {
    // Escludi i lunedì (getDay() === 1)
    if (current.getDay() !== 1) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateBookingCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const isDateInPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

export const validateBookingDate = (date: Date): { isValid: boolean; error?: string } => {
  if (isDateInPast(date)) {
    return {
      isValid: false,
      error: 'Non è possibile prenotare per date passate.'
    };
  }
  
  return { isValid: true };
};
