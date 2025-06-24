
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Booking } from '@/types/booking';
import { generateBookingCode, formatDate } from '@/utils/dateUtils';
import { saveBooking } from '@/utils/supabaseStorage';
import { toast } from '@/hooks/use-toast';

interface AddBookingTabProps {
  onBookingAdded: () => void;
}

const AddBookingTab = ({ onBookingAdded }: AddBookingTabProps) => {
  const [newBooking, setNewBooking] = useState({
    date: '',
    seats: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date();
  const todayString = formatDate(today);

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that the selected date is not in the past
    const selectedDate = new Date(newBooking.date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < currentDate) {
      toast({
        title: "Errore",
        description: "Non è possibile aggiungere prenotazioni per date passate.",
        variant: "destructive"
      });
      return;
    }

    try {
      const booking: Booking = {
        id: crypto.randomUUID(),
        date: newBooking.date,
        seats: parseInt(newBooking.seats),
        name: newBooking.name,
        phone: newBooking.phone,
        email: newBooking.email || '',
        notes: newBooking.notes,
        code: generateBookingCode(),
        created_at: new Date().toISOString()
      };
      
      const success = await saveBooking(booking);
      
      if (success) {
        setNewBooking({ date: '', seats: '', name: '', phone: '', email: '', notes: '' });
        onBookingAdded();
        toast({
          title: "Prenotazione aggiunta",
          description: `Codice: ${booking.code}`
        });
      } else {
        throw new Error('Failed to save booking');
      }
    } catch (error) {
      console.error('Add booking error:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Aggiungi Prenotazione Manuale</h2>
      <Card className="p-6">
        <form onSubmit={handleAddBooking} className="space-y-4">
          <div>
            <Label htmlFor="new-date">Data</Label>
            <Input
              id="new-date"
              type="date"
              value={newBooking.date}
              onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
              min={todayString}
              max="2025-07-27"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Non è possibile aggiungere prenotazioni per date passate
            </p>
          </div>
          <div>
            <Label htmlFor="new-seats">Numero posti</Label>
            <Input
              id="new-seats"
              type="number"
              value={newBooking.seats}
              onChange={(e) => setNewBooking({ ...newBooking, seats: e.target.value })}
              required
              min="1"
            />
          </div>
          <div>
            <Label htmlFor="new-name">Nome</Label>
            <Input
              id="new-name"
              value={newBooking.name}
              onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="new-phone">Telefono</Label>
            <Input
              id="new-phone"
              type="tel"
              value={newBooking.phone}
              onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="new-email">Email (facoltativo)</Label>
            <Input
              id="new-email"
              type="email"
              value={newBooking.email}
              onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="new-notes">Note</Label>
            <Textarea
              id="new-notes"
              value={newBooking.notes}
              onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            Aggiungi Prenotazione
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AddBookingTab;
