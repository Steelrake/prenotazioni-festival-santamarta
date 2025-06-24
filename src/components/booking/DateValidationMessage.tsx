
import { Button } from '@/components/ui/button';
import { formatDisplayDate } from '@/utils/dateUtils';

interface DateValidationMessageProps {
  date: Date;
  onBack: () => void;
}

const DateValidationMessage = ({ date, onBack }: DateValidationMessageProps) => {
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
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Data Non Valida</h2>
          <p className="text-red-700 mb-4">
            Non è possibile prenotare per il giorno {formatDisplayDate(date)} perché è una data passata.
          </p>
          <Button onClick={onBack} variant="outline">
            Seleziona un'altra data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateValidationMessage;
