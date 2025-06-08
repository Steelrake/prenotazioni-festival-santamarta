
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBookings } from '@/utils/storage';
import BookingCard from './BookingCard';

interface SearchTabProps {
  onDeleteBooking: (code: string) => void;
}

const SearchTab = ({ onDeleteBooking }: SearchTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const bookings = getBookings();

  const searchResults = searchTerm ? bookings.filter(booking => 
    booking.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="search">Cerca per codice o nominativo</Label>
        <Input
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Inserisci codice prenotazione o nome cliente..."
          className="mt-2"
        />
      </div>
      
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Risultati ({searchResults.length})</h3>
          {searchResults.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onDelete={onDeleteBooking} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchTab;
