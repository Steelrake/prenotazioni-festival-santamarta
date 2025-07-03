
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getRestaurantDates, formatDisplayDate, formatDate } from '@/utils/dateUtils';
import { getDayAvailability } from '@/utils/supabaseStorage';
import { cn } from '@/lib/utils';
import { DayAvailability } from '@/types/booking';

interface BookingCalendarProps {
  onDateSelect: (date: Date) => void;
  onBack: () => void;
}

const BookingCalendar = ({ onDateSelect, onBack }: BookingCalendarProps) => {
  const [availabilities, setAvailabilities] = useState<Record<string, DayAvailability>>({});
  const [loading, setLoading] = useState(true);
  const restaurantDates = getRestaurantDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

  useEffect(() => {
    const loadAvailabilities = async () => {
      setLoading(true);
      const data: Record<string, DayAvailability> = {};
      
      for (const date of restaurantDates) {
        const availability = await getDayAvailability(date);
        data[availability.date] = availability;
      }
      
      setAvailabilities(data);
      setLoading(false);
    };

    loadAvailabilities();
  }, []);

  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    const availability = availabilities[dateStr];
    
    // Check if date is in the past
    if (date < today) {
      return; // Don't allow selection of past dates
    }
    
    if (availability && !availability.isSoldOut) {
      onDateSelect(date);
    }
  };

  const isDateInPast = (date: Date) => {
    return date < today;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Caricamento calendario...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Button 
          onClick={onBack}
          variant="outline"
          className="mb-4"
        >
          ← Torna Indietro
        </Button>
        <h2 className="text-3xl font-bold text-center mb-2">Seleziona la Data</h2>
        <p className="text-center text-muted-foreground">
          Clicca sul giorno per procedere con la prenotazione
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurantDates.map((date) => {
          const dateStr = formatDate(date);
          const availability = availabilities[dateStr];
          const isPastDate = isDateInPast(date);
          
          if (!availability) return null;
          
          return (
            <Card
              key={dateStr}
              className={cn(
                "p-4 transition-all duration-200",
                isPastDate 
                  ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-50" 
                  : availability.isSoldOut 
                    ? "bg-red-100 border-red-300 cursor-not-allowed opacity-60" 
                    : "bg-green-50 border-green-300 hover:bg-green-100 cursor-pointer hover:scale-105"
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-center">
                <div className="font-semibold text-lg mb-2">
                  {formatDisplayDate(date)}
                </div>
                {isPastDate ? (
                  <div className="text-gray-500 font-medium">
                    DATA PASSATA
                  </div>
                ) : availability.isSoldOut ? (
                  <div className="text-red-600 font-medium">
                    COMPLETO
                  </div>
                ) : (
                  <div className="text-green-600 font-medium">
                    DISPONIBILE
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BookingCalendar;
