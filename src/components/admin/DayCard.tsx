
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DayAvailability } from '@/types/booking';
import { formatDisplayDate } from '@/utils/dateUtils';

interface DayCardProps {
  date: Date;
  availability: DayAvailability;
}

const DayCard = ({ date, availability }: DayCardProps) => {
  const dateStr = date.toISOString().split('T')[0];
  
  return (
    <Card key={dateStr} className="p-4">
      <div className="text-center">
        <h3 className="font-semibold mb-2">
          {formatDisplayDate(date)}
        </h3>
        <div className="space-y-2">
          {availability.isSoldOut ? (
            <Badge variant="destructive">SOLD OUT</Badge>
          ) : (
            <Badge variant="secondary">
              {availability.availableSeats} liberi
            </Badge>
          )}
          <div className="text-sm text-muted-foreground">
            {availability.bookedSeats}/{availability.totalSeats} prenotati
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DayCard;
