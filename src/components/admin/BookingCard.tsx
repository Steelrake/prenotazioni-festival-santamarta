
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/types/booking';
import { formatDisplayDate } from '@/utils/dateUtils';

interface BookingCardProps {
  booking: Booking;
  onDelete: (code: string) => void;
}

const BookingCard = ({ booking, onDelete }: BookingCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="font-semibold">{booking.name}</div>
          <div className="text-sm text-muted-foreground">
            {booking.email} | {booking.phone} | {booking.seats} posti
          </div>
          <div className="text-sm">
            Data: {formatDisplayDate(new Date(booking.date))}
          </div>
          {booking.notes && (
            <div className="text-sm text-muted-foreground">
              Note: {booking.notes}
            </div>
          )}
        </div>
        <div className="text-right space-y-2">
          <Badge variant="outline">{booking.code}</Badge>
          <div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(booking.code)}
            >
              Elimina
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookingCard;
