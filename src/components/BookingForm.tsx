
import BookingFormContainer from './booking/BookingFormContainer';

interface BookingFormProps {
  date: Date;
  onBack: () => void;
  onSuccess: (code: string) => void;
}

const BookingForm = ({ date, onBack, onSuccess }: BookingFormProps) => {
  return <BookingFormContainer date={date} onBack={onBack} onSuccess={onSuccess} />;
};

export default BookingForm;
