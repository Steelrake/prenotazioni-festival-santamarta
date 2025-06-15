
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDisplayDate, generateBookingCode } from '@/utils/dateUtils';
import { saveBooking, getDayAvailability } from '@/utils/supabaseStorage';
import { toast } from '@/hooks/use-toast';

interface BookingFormProps {
  date: Date;
  onBack: () => void;
  onSuccess: (code: string) => void;
}

const BookingForm = ({ date, onBack, onSuccess }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    seats: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<any>(null);

  // Load availability when component mounts
  useState(() => {
    const loadAvailability = async () => {
      const data = await getDayAvailability(date);
      setAvailability(data);
    };
    loadAvailability();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get latest availability
      const currentAvailability = await getDayAvailability(date);
      const seats = parseInt(formData.seats);
      
      if (seats <= 0 || seats > currentAvailability.availableSeats) {
        toast({
          title: "Errore",
          description: `Puoi prenotare da 1 a ${currentAvailability.availableSeats} posti.`,
          variant: "destructive"
        });
        return;
      }

      const bookingCode = generateBookingCode();
      const booking = {
        id: crypto.randomUUID(),
        date: date.toISOString().split('T')[0],
        seats,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        notes: formData.notes.trim(),
        code: bookingCode,
        created_at: new Date().toISOString()
      };

      const success = await saveBooking(booking);
      
      if (success) {
        onSuccess(bookingCode);
        toast({
          title: "Prenotazione Confermata!",
          description: `Il tuo codice è: ${bookingCode}`,
        });
      } else {
        throw new Error('Failed to save booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la prenotazione.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!availability) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <Button 
          onClick={onBack}
          variant="outline"
          className="mb-4"
        >
          ← Cambia Data
        </Button>
        <h2 className="text-3xl font-bold text-center mb-2">Completa la Prenotazione</h2>
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <p className="text-lg font-semibold">{formatDisplayDate(date)}</p>
          <p className="text-muted-foreground">{availability.availableSeats} posti disponibili</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="seats" className="text-base font-medium">
              Numero di posti *
            </Label>
            <Input
              id="seats"
              type="number"
              min="1"
              max={availability.availableSeats}
              value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
              required
              className="mt-2"
              placeholder={`Max ${availability.availableSeats} posti`}
            />
          </div>

          <div>
            <Label htmlFor="name" className="text-base font-medium">
              Nominativo *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-2"
              placeholder="Il tuo nome e cognome"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-base font-medium">
              Telefono *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="mt-2"
              placeholder="Il tuo numero di telefono"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-base font-medium">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-2"
              placeholder="la-tua-email@esempio.com"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-base font-medium">
              Note (facoltativo)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-2"
              placeholder="Eventuali richieste speciali..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            {isSubmitting ? 'Salvando...' : 'Conferma Prenotazione'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BookingForm;
