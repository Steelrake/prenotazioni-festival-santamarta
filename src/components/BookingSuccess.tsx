
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface BookingSuccessProps {
  code: string;
  onNewBooking: () => void;
}

const BookingSuccess = ({ code, onNewBooking }: BookingSuccessProps) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Prenotazione Confermata!
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6">
          La tua prenotazione è stata registrata con successo.
        </p>
        
        <div className="bg-primary/10 p-6 rounded-lg mb-6">
          <p className="text-sm text-muted-foreground mb-2">Il tuo codice di prenotazione è:</p>
          <p className="text-3xl font-bold font-mono text-primary">{code}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Conserva questo codice per eventuali modifiche o cancellazioni
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onNewBooking}
            size="lg"
            className="w-full"
          >
            Nuova Prenotazione
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Torna alla Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BookingSuccess;
