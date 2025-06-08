
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Booking } from '@/types/booking';
import { generateBookingCode } from '@/utils/dateUtils';
import { saveBooking } from '@/utils/supabaseStorage';
import { toast } from '@/hooks/use-toast';

const AddBookingTab = () => {
  const [newBooking, setNewBooking] = useState({
    date: '',
    seats: '',
    name: '',
    email: '',
    notes: ''
  });

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const booking: Booking = {
        id: crypto.randomUUID(),
        date: newBooking.date,
        seats: parseInt(newBooking.seats),
        name: newBooking.name,
        email: newBooking.email,
        notes: newBooking.notes,
        code: generateBookingCode(),
        created_at: new Date().toISOString()
      };
      
      const success = await saveBooking(booking);
      
      if (success) {
        setNewBooking({ date: '', seats: '', name: '', email: '', notes: '' });
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
              min="2025-06-30"
              max="2025-07-27"
              required
            />
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
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              value={newBooking.email}
              onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
              required
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
