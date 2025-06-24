
import { useState } from 'react';
import { generateBookingCode } from '@/utils/dateUtils';
import { saveBooking, getDayAvailability } from '@/utils/supabaseStorage';
import { toast } from '@/hooks/use-toast';
import { Booking } from '@/types/booking';

interface FormData {
  seats: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const useBookingForm = (date: Date, onSuccess: (code: string) => void) => {
  const [formData, setFormData] = useState<FormData>({
    seats: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast({
        title: "Errore",
        description: "Non è possibile prenotare per date passate.",
        variant: "destructive"
      });
      return;
    }

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
      const booking: Booking = {
        id: crypto.randomUUID(),
        date: date.toISOString().split('T')[0],
        seats,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || '',
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

  return {
    formData,
    updateFormData,
    handleSubmit,
    isSubmitting
  };
};
