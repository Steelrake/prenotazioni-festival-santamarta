
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { FileText, FileSpreadsheet, Calendar as CalendarIcon } from 'lucide-react';
import { Booking } from '@/types/booking';
import { formatDisplayDate } from '@/utils/dateUtils';

interface ExportTabProps {
  bookings: Booking[];
}

const ExportTab = ({ bookings }: ExportTabProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

  const exportToPDF = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBookings = bookings.filter(booking => booking.date === dateStr);
    
    // Create PDF content
    let pdfContent = `Prenotazioni del ${formatDisplayDate(date)}\n\n`;
    
    if (dayBookings.length === 0) {
      pdfContent += 'Nessuna prenotazione per questo giorno.';
    } else {
      dayBookings.forEach((booking, index) => {
        pdfContent += `${index + 1}. ${booking.name}\n`;
        pdfContent += `   Email: ${booking.email}\n`;
        pdfContent += `   Posti: ${booking.seats}\n`;
        pdfContent += `   Codice: ${booking.code}\n`;
        if (booking.notes) {
          pdfContent += `   Note: ${booking.notes}\n`;
        }
        pdfContent += `   Prenotato il: ${format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}\n\n`;
      });
      
      pdfContent += `\nTotale prenotazioni: ${dayBookings.length}\n`;
      pdfContent += `Totale posti: ${dayBookings.reduce((total, booking) => total + booking.seats, 0)}`;
    }
    
    // Create and download PDF (simplified text version)
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prenotazioni-${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setIsDateDialogOpen(false);
    setSelectedDate(undefined);
  };

  const exportToExcel = () => {
    // Create CSV content
    let csvContent = 'Data,Nome,Email,Posti,Codice,Note,Data Prenotazione\n';
    
    bookings.forEach(booking => {
      const row = [
        booking.date,
        `"${booking.name}"`,
        booking.email,
        booking.seats,
        booking.code,
        `"${booking.notes || ''}"`,
        format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm', { locale: it })
      ].join(',');
      csvContent += row + '\n';
    });
    
    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tutte-le-prenotazioni.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      exportToPDF(date);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Esporta Dati</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4 p-6 border rounded-lg">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Esporta PDF Giornaliero</h3>
          </div>
          <p className="text-muted-foreground">
            Esporta le prenotazioni di un giorno specifico in formato PDF
          </p>
          
          <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Seleziona Data per PDF
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seleziona la data per l'esportazione PDF</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={it}
                  className="rounded-md border"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4 p-6 border rounded-lg">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Esporta Excel</h3>
          </div>
          <p className="text-muted-foreground">
            Esporta tutte le prenotazioni in formato Excel (CSV)
          </p>
          
          <Button onClick={exportToExcel} className="w-full">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Scarica Excel
          </Button>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-muted/50">
        <h4 className="font-medium mb-2">Statistiche</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Prenotazioni totali:</span>
            <span className="ml-2 font-medium">{bookings.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Posti totali:</span>
            <span className="ml-2 font-medium">
              {bookings.reduce((total, booking) => total + booking.seats, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportTab;
