
import { useBookings } from '@/hooks/useBookings';
import BookingCard from './BookingCard';

interface BookingsTabProps {
  onDeleteBooking: (code: string) => void;
}

const BookingsTab = ({ onDeleteBooking }: BookingsTabProps) => {
  const { bookings, loading } = useBookings();

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Tutte le Prenotazioni</h2>
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

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
