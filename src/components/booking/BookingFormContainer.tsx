
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDisplayDate } from '@/utils/dateUtils';
import { useBookingAvailability } from '@/hooks/useBookingAvailability';
import { useBookingForm } from '@/hooks/useBookingForm';
import DateValidationMessage from './DateValidationMessage';
import BookingFormFields from './BookingFormFields';

interface BookingFormContainerProps {
  date: Date;
  onBack: () => void;
  onSuccess: (code: string) => void;
}

const BookingFormContainer = ({ date, onBack, onSuccess }: BookingFormContainerProps) => {
  const { availability, loading } = useBookingAvailability(date);
  const { formData, updateFormData, handleSubmit, isSubmitting } = useBookingForm(date, onSuccess);

  // Check if the selected date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const isDateInPast = selectedDate < today;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">Errore nel caricamento dei dati.</div>
      </div>
    );
  }

  // If date is in the past, show error message
  if (isDateInPast) {
    return <DateValidationMessage date={date} onBack={onBack} />;
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
        <BookingFormFields
          formData={formData}
          onFormDataChange={updateFormData}
          onSubmit={handleSubmit}
          availability={availability}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
};

export default BookingFormContainer;
