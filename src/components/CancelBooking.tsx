
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteBooking, getBookingByCode } from '@/utils/storage';
import { toast } from '@/hooks/use-toast';
import { X, Check } from 'lucide-react';

interface CancelBookingProps {
  onBack: () => void;
}

const CancelBooking = ({ onBack }: CancelBookingProps) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const booking = getBookingByCode(code.toUpperCase());
      
      if (!booking) {
        toast({
          title: "Codice Non Trovato",
          description: "Il codice inserito non corrisponde a nessuna prenotazione.",
          variant: "destructive"
        });
        return;
      }

      const success = deleteBooking(code.toUpperCase());
      
      if (success) {
        setCancelled(true);
        toast({
          title: "Prenotazione Cancellata",
          description: "La tua prenotazione è stata cancellata con successo.",
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante la cancellazione.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la cancellazione.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cancelled) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Prenotazione Cancellata
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6">
            La tua prenotazione è stata cancellata con successo.
          </p>
          
          <Button 
            onClick={() => window.location.reload()}
            size="lg"
            className="w-full"
          >
            Torna alla Home
          </Button>
        </Card>
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
          ← Torna Indietro
        </Button>
        <h2 className="text-3xl font-bold text-center mb-2 text-red-600">Disdici Prenotazione</h2>
        <p className="text-center text-muted-foreground">
          Inserisci il codice di prenotazione per cancellare
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="code" className="text-base font-medium">
              Codice Prenotazione
            </Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="mt-2 font-mono text-center text-lg"
              placeholder="Inserisci il codice (5 caratteri)"
              maxLength={5}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Il codice è composto da 5 caratteri alfanumerici
            </p>
          </div>

          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting || code.length !== 5}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
          >
            <X className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Cancellando...' : 'Cancella Prenotazione'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CancelBooking;
