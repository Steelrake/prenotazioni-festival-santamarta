
import { Booking } from '@/types/booking';

interface ExportTabProps {
  bookings: Booking[];
}

const ExportTab = ({ bookings }: ExportTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Esporta Dati</h2>
      <div className="space-y-4">
        <p>Funzionalità di esportazione in sviluppo...</p>
        <p>Prenotazioni totali: {bookings.length}</p>
      </div>
    </div>
  );
};

export default ExportTab;
