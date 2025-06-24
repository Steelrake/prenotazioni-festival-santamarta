
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DayAvailability } from '@/types/booking';

interface FormData {
  seats: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface BookingFormFieldsProps {
  formData: FormData;
  onFormDataChange: (field: keyof FormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  availability: DayAvailability;
  isSubmitting: boolean;
}

const BookingFormFields = ({ 
  formData, 
  onFormDataChange, 
  onSubmit, 
  availability, 
  isSubmitting 
}: BookingFormFieldsProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          onChange={(e) => onFormDataChange('seats', e.target.value)}
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
          onChange={(e) => onFormDataChange('name', e.target.value)}
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
          onChange={(e) => onFormDataChange('phone', e.target.value)}
          required
          className="mt-2"
          placeholder="Il tuo numero di telefono"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-base font-medium">
          Email (facoltativo)
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange('email', e.target.value)}
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
          onChange={(e) => onFormDataChange('notes', e.target.value)}
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
  );
};

export default BookingFormFields;
