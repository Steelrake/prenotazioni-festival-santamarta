
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { Booking } from '@/types/booking';
import BookingCard from './BookingCard';

interface BookingsTabProps {
  bookings: Booking[];
  onDeleteBooking: (code: string) => void;
}

const BookingsTab = ({ bookings, onDeleteBooking }: BookingsTabProps) => {
  const handleExportCSV = () => {
    try {
      // Create CSV header
      const headers = ['Codice', 'Nome', 'Email', 'Data', 'Posti', 'Note', 'Data Prenotazione'];
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...bookings.map(booking => [
          booking.code,
          `"${booking.name}"`,
          booking.email,
          booking.date,
          booking.seats,
          `"${booking.notes || ''}"`,
          new Date(booking.created_at).toLocaleDateString('it-IT')
        ].join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prenotazioni_complete_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tutte le Prenotazioni ({bookings.length})</h2>
        <Button
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          <FileSpreadsheet size={16} />
          Esporta CSV
        </Button>
      </div>
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
