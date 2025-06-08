
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRestaurantDates, formatDisplayDate } from '@/utils/dateUtils';
import { getDayAvailability } from '@/utils/supabaseStorage';
import { Lock, Unlock } from 'lucide-react';
import { DayAvailability } from '@/types/booking';

interface ManageTabProps {
  onSoldOut: (date: string, isSoldOut: boolean) => void;
  onMaxSeatsChange: (date: string, maxSeats: number) => void;
  onResetDay: (date: string) => void;
}

const ManageTab = ({ onSoldOut, onMaxSeatsChange, onResetDay }: ManageTabProps) => {
  const [availabilities, setAvailabilities] = useState<Record<string, DayAvailability>>({});
  const [loading, setLoading] = useState(true);
  const restaurantDates = getRestaurantDates();

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

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const handleSoldOut = async (date: string, isSoldOut: boolean) => {
    await onSoldOut(date, isSoldOut);
    loadAvailabilities(); // Refresh data
  };

  const handleMaxSeatsChange = async (date: string, maxSeats: number) => {
    await onMaxSeatsChange(date, maxSeats);
    loadAvailabilities(); // Refresh data
  };

  const handleResetDay = async (date: string) => {
    await onResetDay(date);
    loadAvailabilities(); // Refresh data
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Gestione Giorni</h2>
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gestione Giorni</h2>
      <div className="space-y-4">
        {restaurantDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const availability = availabilities[dateStr];
          
          if (!availability) return null;
          
          return (
            <Card key={dateStr} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{formatDisplayDate(date)}</h3>
                  <div className="text-sm text-muted-foreground">
                    {availability.bookedSeats}/{availability.totalSeats} prenotati
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={availability.totalSeats}
                    onChange={(e) => handleMaxSeatsChange(dateStr, parseInt(e.target.value))}
                    className="w-20"
                    min="1"
                  />
                  <Button
                    size="sm"
                    variant={availability.isSoldOut ? "destructive" : "default"}
                    onClick={() => handleSoldOut(dateStr, !availability.isSoldOut)}
                    className="min-w-[120px] gap-2"
                  >
                    {availability.isSoldOut ? (
                      <>
                        <Lock size={16} />
                        Chiuso
                      </>
                    ) : (
                      <>
                        <Unlock size={16} />
                        Aperto
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleResetDay(dateStr)}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ManageTab;
