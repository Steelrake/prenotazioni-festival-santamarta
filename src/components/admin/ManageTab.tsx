
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRestaurantDates, getDayAvailability, formatDisplayDate } from '@/utils/dateUtils';
import { Lock, Unlock } from 'lucide-react';

interface ManageTabProps {
  onSoldOut: (date: string, isSoldOut: boolean) => void;
  onMaxSeatsChange: (date: string, maxSeats: number) => void;
  onResetDay: (date: string) => void;
}

const ManageTab = ({ onSoldOut, onMaxSeatsChange, onResetDay }: ManageTabProps) => {
  const restaurantDates = getRestaurantDates();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gestione Giorni</h2>
      <div className="space-y-4">
        {restaurantDates.map((date) => {
          const availability = getDayAvailability(date);
          const dateStr = date.toISOString().split('T')[0];
          
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
                    onChange={(e) => onMaxSeatsChange(dateStr, parseInt(e.target.value))}
                    className="w-20"
                    min="1"
                  />
                  <Button
                    size="sm"
                    variant={availability.isSoldOut ? "destructive" : "outline"}
                    onClick={() => onSoldOut(dateStr, !availability.isSoldOut)}
                    className={`min-w-[120px] gap-2 ${
                      availability.isSoldOut 
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
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
                    onClick={() => onResetDay(dateStr)}
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
