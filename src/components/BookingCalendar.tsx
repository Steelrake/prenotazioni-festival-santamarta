
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getRestaurantDates, formatDisplayDate, formatDate } from '@/utils/dateUtils';
import { getDayAvailability } from '@/utils/storage';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  onDateSelect: (date: Date) => void;
  onBack: () => void;
}

const BookingCalendar = ({ onDateSelect, onBack }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const restaurantDates = getRestaurantDates();

  const handleDateClick = (date: Date) => {
    const availability = getDayAvailability(date);
    if (!availability.isSoldOut) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
    }
  };

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
          Scegli il giorno per la tua prenotazione
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {restaurantDates.map((date) => {
          const availability = getDayAvailability(date);
          const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);
          
          return (
            <Card
              key={formatDate(date)}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:scale-105",
                availability.isSoldOut 
                  ? "bg-red-100 border-red-300 cursor-not-allowed opacity-60" 
                  : "bg-green-50 border-green-300 hover:bg-green-100",
                isSelected && "ring-2 ring-primary bg-primary/10"
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-center">
                <div className="font-semibold text-lg mb-2">
                  {formatDisplayDate(date)}
                </div>
                {availability.isSoldOut ? (
                  <div className="text-red-600 font-medium">
                    COMPLETO
                  </div>
                ) : (
                  <div className="text-green-600 font-medium">
                    {availability.availableSeats} posti liberi
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {selectedDate && (
        <div className="text-center">
          <div className="mb-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Data Selezionata:</h3>
            <p className="text-lg">{formatDisplayDate(selectedDate)}</p>
          </div>
          <Button 
            onClick={handleConfirm}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            Continua con la Prenotazione
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
