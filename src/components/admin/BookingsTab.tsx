
import { Booking } from '@/types/booking';
import BookingCard from './BookingCard';

interface BookingsTabProps {
  bookings: Booking[];
  onDeleteBooking: (code: string) => void;
}

const BookingsTab = ({ bookings, onDeleteBooking }: BookingsTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Tutte le Prenotazioni ({bookings.length})</h2>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <BookingCard 
            key={booking.id} 
            booking={booking} 
            onDelete={onDeleteBooking} 
          />
        ))}
      </div>
    </div>
  );
};

export default BookingsTab;
