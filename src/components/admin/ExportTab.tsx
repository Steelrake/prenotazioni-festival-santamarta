
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getRestaurantDates, formatDisplayDate, formatDate } from '@/utils/dateUtils';
import { getDayAvailability, getBookingsByDate, getBookings } from '@/utils/supabaseStorage';
import { toast } from '@/hooks/use-toast';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DayAvailability } from '@/types/booking';

const ExportTab = () => {
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [availabilities, setAvailabilities] = useState<Record<string, DayAvailability>>({});
  const [loading, setLoading] = useState(false);
  const restaurantDates = getRestaurantDates();

  const loadAvailabilities = async () => {
    setLoading(true);
    const data: Record<string, DayAvailability> = {};
    
    for (const date of restaurantDates) {
      const availability = await getDayAvailability(date);
      data[availability.date] = availability;
    }
    
    setAvailabilities(data);
    setLoading(false);
  };

  const handlePdfClick = async () => {
    await loadAvailabilities();
    setShowDateSelector(true);
  };

  const handleDateSelection = async (date: Date) => {
    const dateStr = formatDate(date);
    const bookings = await getBookingsByDate(dateStr);
    
    // Crea il contenuto PDF
    const pdfContent = generatePdfContent(date, bookings);
    
    // Crea il blob PDF
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    
    // Formatta la data per il nome file
    const formattedDate = date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '-');
    
    // Crea il link per il download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prenotazioni online ${formattedDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowDateSelector(false);
    toast({
      title: "PDF generato",
      description: `File delle prenotazioni del ${formatDisplayDate(date)} scaricato.`
    });
  };

  const handleExcelClick = async () => {
    const allBookings = await getBookings();
    
    // Crea il contenuto Excel (CSV)
    const csvContent = generateCsvContent(allBookings);
    
    // Crea il blob CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Crea il link per il download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'riepilogo_prenotazioni.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Excel generato",
      description: "File riepilogativo delle prenotazioni scaricato."
    });
  };

  const generatePdfContent = (date: Date, bookings: any[]) => {
    const formattedDate = formatDisplayDate(date);
    let content = `PRENOTAZIONI ONLINE - ${formattedDate.toUpperCase()}\n`;
    content += `${'='.repeat(50)}\n\n`;
    
    if (bookings.length === 0) {
      content += "Nessuna prenotazione per questa data.\n";
    } else {
      content += `Totale prenotazioni: ${bookings.length}\n`;
      content += `Totale posti: ${bookings.reduce((sum, b) => sum + b.seats, 0)}\n\n`;
      
      bookings.forEach((booking, index) => {
        content += `${index + 1}. ${booking.name}\n`;
        content += `   Email: ${booking.email}\n`;
        content += `   Posti: ${booking.seats}\n`;
        content += `   Codice: ${booking.code}\n`;
        if (booking.notes) {
          content += `   Note: ${booking.notes}\n`;
        }
        content += `   Prenotato il: ${new Date(booking.created_at).toLocaleString('it-IT')}\n\n`;
      });
    }
    
    return content;
  };

  const generateCsvContent = (bookings: any[]) => {
    let csv = 'Data,Nome,Email,Posti,Codice,Note,Prenotato il\n';
    
    bookings.forEach(booking => {
      const notes = booking.notes ? booking.notes.replace(/"/g, '""') : '';
      const createdAt = new Date(booking.created_at).toLocaleString('it-IT');
      csv += `"${booking.date}","${booking.name}","${booking.email}",${booking.seats},"${booking.code}","${notes}","${createdAt}"\n`;
    });
    
    return csv;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    const availability = availabilities[dateStr];
    if (availability) {
      handleDateSelection(date);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Esporta Dati</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Card className="p-6">
          <div className="space-y-4 text-center">
            <FileText className="w-12 h-12 mx-auto text-red-600" />
            <h3 className="text-xl font-semibold">PDF Giornaliero</h3>
            <p className="text-muted-foreground">
              Genera un PDF con le prenotazioni di una data specifica
            </p>
            <Button
              onClick={handlePdfClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF Giornaliero
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4 text-center">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-green-600" />
            <h3 className="text-xl font-semibold">Excel Riepilogativo</h3>
            <p className="text-muted-foreground">
              Genera un Excel con tutte le prenotazioni registrate
            </p>
            <Button
              onClick={handleExcelClick}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={showDateSelector} onOpenChange={setShowDateSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Seleziona la Data per il PDF</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="text-center py-8">Caricamento calendario...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {restaurantDates.map((date) => {
                const dateStr = formatDate(date);
                const availability = availabilities[dateStr];
                
                if (!availability) return null;
                
                return (
                  <Card
                    key={dateStr}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 hover:scale-105",
                      availability.isSoldOut 
                        ? "bg-red-100 border-red-300" 
                        : "bg-green-50 border-green-300 hover:bg-green-100"
                    )}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-lg mb-2">
                        {formatDisplayDate(date)}
                      </div>
                      {availability.isSoldOut ? (
                        <div className="text-red-600 font-medium">
                          COMPLETO
                        </div>
                      ) : (
                        <div className="text-green-600 font-medium">
                          {availability.bookedSeats} prenotazioni
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExportTab;
