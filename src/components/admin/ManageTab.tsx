
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getRestaurantDates, formatDisplayDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Lock, Unlock, Save, Download, Users, UserCheck, Eye, FileSpreadsheet } from 'lucide-react';
import { DayAvailability, Booking } from '@/types/booking';
import { getBookingsByDate, getDaySettings } from '@/utils/supabaseStorage';

interface ManageTabProps {
  availabilities: Record<string, DayAvailability>;
  daySettings: Record<string, { maxSeats: number; isSoldOut: boolean }>;
  onSoldOut: (date: string, isSoldOut: boolean) => void;
  onMaxSeatsChange: (date: string, maxSeats: number) => void;
  onResetDay: (date: string) => void;
  onSave: () => void;
}

interface LocalChanges {
  [date: string]: {
    totalSeats?: number;
    isSoldOut?: boolean;
  };
}

const ManageTab = ({ 
  availabilities, 
  daySettings, 
  onSoldOut, 
  onMaxSeatsChange, 
  onResetDay,
  onSave 
}: ManageTabProps) => {
  const [localChanges, setLocalChanges] = useState<LocalChanges>({});
  const [saving, setSaving] = useState(false);
  const [bookingsDialogOpen, setBookingsDialogOpen] = useState(false);
  const [selectedDateBookings, setSelectedDateBookings] = useState<{ date: string; bookings: Booking[] }>({ date: '', bookings: [] });
  const restaurantDates = getRestaurantDates();

  const handleLocalSoldOutChange = (date: string, isSoldOut: boolean) => {
    setLocalChanges(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        isSoldOut
      }
    }));
  };

  const handleLocalMaxSeatsChange = (date: string, maxSeats: number) => {
    setLocalChanges(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        totalSeats: maxSeats
      }
    }));
  };

  const handleResetDayLocal = async (date: string) => {
    await onResetDay(date);
    // Remove local changes for this date since it's been reset
    setLocalChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[date];
      return newChanges;
    });
  };

  const handleDownloadDay = async (dateStr: string) => {
    try {
      const bookings = await getBookingsByDate(dateStr);
      const date = new Date(dateStr);
      const formattedDate = formatDisplayDate(date);
      const availability = availabilities[dateStr];
      
      let content = `Prenotazioni per ${formattedDate}\n`;
      content += `Data: ${dateStr}\n`;
      content += `Totale prenotazioni: ${bookings.length}\n`;
      content += `Posti totali disponibili: ${availability?.totalSeats || 150}\n`;
      content += `Posti effettivamente occupati: ${bookings.reduce((sum, b) => sum + b.seats, 0)}\n\n`;
      
      if (bookings.length === 0) {
        content += 'Nessuna prenotazione per questo giorno.\n';
      } else {
        content += 'ELENCO PRENOTAZIONI:\n';
        content += '===================\n\n';
        
        bookings.forEach((booking, index) => {
          content += `${index + 1}. Nominativo: ${booking.name}\n`;
          content += `   Telefono: ${booking.phone}\n`;
          content += `   N. Posti: ${booking.seats}\n`;
          if (booking.notes) {
            content += `   Note: ${booking.notes}\n`;
          }
          content += `   E-mail: ${booking.email}\n`;
          content += `   Data Prenotazione: ${new Date(booking.created_at).toLocaleDateString('it-IT')}\n`;
          content += `   Codice: ${booking.code}\n\n`;
        });
      }
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prenotazioni_${dateStr}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading day data:', error);
    }
  };

  const handleViewBookings = async (dateStr: string) => {
    try {
      const bookings = await getBookingsByDate(dateStr);
      setSelectedDateBookings({ date: dateStr, bookings });
      setBookingsDialogOpen(true);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleDownloadDayCSV = (dateStr: string, bookings: Booking[]) => {
    // Create CSV content with same structure as ExportTab
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
    link.download = `prenotazioni-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      // Apply all local changes to the database
      for (const [date, changes] of Object.entries(localChanges)) {
        if (changes.totalSeats !== undefined) {
          await onMaxSeatsChange(date, changes.totalSeats);
        }
        if (changes.isSoldOut !== undefined) {
          await onSoldOut(date, changes.isSoldOut);
        }
      }
      
      // Clear local changes after successful save
      setLocalChanges({});
      
      // Refresh data from database
      onSave();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = Object.keys(localChanges).length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gestione Giorni</h2>
      <div className="space-y-4">
        {restaurantDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const availability = availabilities[dateStr];
          const settings = daySettings[dateStr] || { maxSeats: 100, isSoldOut: false };
          const localChange = localChanges[dateStr];
          
          if (!availability) return null;
          
          // Use local changes if available, otherwise use database values
          const currentTotalSeats = localChange?.totalSeats ?? availability.totalSeats;
          const currentIsSoldOut = localChange?.isSoldOut ?? settings.isSoldOut;
          const hasLocalChanges = localChange !== undefined;
          
          // Calculate percentages and colors
          const bookedPercentage = currentTotalSeats > 0 ? (availability.bookedSeats / currentTotalSeats) * 100 : 0;
          const availableSeats = currentTotalSeats - availability.bookedSeats;
          
          // Determine status color
          let statusColor = 'bg-green-100 border-green-200';
          let statusTextColor = 'text-green-800';
          
          if (currentIsSoldOut) {
            statusColor = 'bg-red-100 border-red-200';
            statusTextColor = 'text-red-800';
          } else if (bookedPercentage >= 90) {
            statusColor = 'bg-orange-100 border-orange-200';
            statusTextColor = 'text-orange-800';
          } else if (bookedPercentage >= 70) {
            statusColor = 'bg-yellow-100 border-yellow-200';
            statusTextColor = 'text-yellow-800';
          }
          
          return (
            <Card key={dateStr} className={`p-6 ${hasLocalChanges ? 'border-orange-300 bg-orange-50' : statusColor}`}>
              <div className="space-y-4">
                {/* Header with date and status */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{formatDisplayDate(date)}</h3>
                    {hasLocalChanges && (
                      <span className="text-sm text-orange-600 font-medium">
                        (modifiche non salvate)
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={currentTotalSeats}
                      onChange={(e) => handleLocalMaxSeatsChange(dateStr, parseInt(e.target.value))}
                      className="w-20"
                      min="1"
                    />
                    <Button
                      size="sm"
                      variant={currentIsSoldOut ? "destructive" : "default"}
                      onClick={() => handleLocalSoldOutChange(dateStr, !currentIsSoldOut)}
                      className={`min-w-[120px] gap-2 ${
                        !currentIsSoldOut ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                      }`}
                    >
                      {currentIsSoldOut ? (
                        <>
                          <Lock size={16} />
                          Chiuso
                        </>
                      ) : (
                        <>
                          <Unlock size={16} />
                          Aperto
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Visual seats indicator */}
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Occupazione Posti</span>
                      <span className={bookedPercentage >= 90 ? 'text-red-600' : bookedPercentage >= 70 ? 'text-orange-600' : 'text-green-600'}>
                        {bookedPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={bookedPercentage} 
                      className="h-3"
                    />
                  </div>

                  {/* Seats summary cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Booked seats */}
                    <div 
                      className="bg-red-50 border border-red-200 rounded-lg p-3 cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => handleViewBookings(dateStr)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <UserCheck className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Prenotati</span>
                        <Eye className="w-3 h-3 text-red-600 ml-auto" />
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {availability.bookedSeats}
                      </div>
                      <div className="text-xs text-red-600">
                        posti occupati - clicca per dettagli
                      </div>
                    </div>

                    {/* Available seats */}
                    <div className={`${currentIsSoldOut ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'} rounded-lg p-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className={`w-4 h-4 ${currentIsSoldOut ? 'text-gray-600' : 'text-green-600'}`} />
                        <span className={`text-sm font-medium ${currentIsSoldOut ? 'text-gray-800' : 'text-green-800'}`}>
                          {currentIsSoldOut ? 'Non Disponibili' : 'Disponibili'}
                        </span>
                      </div>
                      <div className={`text-2xl font-bold ${currentIsSoldOut ? 'text-gray-600' : 'text-green-600'}`}>
                        {currentIsSoldOut ? 0 : availableSeats}
                      </div>
                      <div className={`text-xs ${currentIsSoldOut ? 'text-gray-600' : 'text-green-600'}`}>
                        posti liberi
                      </div>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${statusColor} ${statusTextColor}`}>
                    {currentIsSoldOut ? (
                      '🔒 SOLD OUT - Prenotazioni chiuse'
                    ) : bookedPercentage >= 90 ? (
                      '⚠️ QUASI PIENO - Ultimi posti disponibili'
                    ) : bookedPercentage >= 70 ? (
                      '🟡 OCCUPAZIONE ALTA - Pochi posti rimasti'
                    ) : (
                      '✅ DISPONIBILE - Molti posti liberi'
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleDownloadDay(dateStr)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white gap-2"
                  >
                    <Download size={16} />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleResetDayLocal(dateStr)}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {hasUnsavedChanges && (
        <div className="flex justify-center pt-6 border-t">
          <Button
            onClick={saveAllChanges}
            disabled={saving}
            size="lg"
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Save size={20} />
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </Button>
        </div>
      )}

      {/* Bookings Detail Dialog */}
      <Dialog open={bookingsDialogOpen} onOpenChange={setBookingsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Prenotazioni del {selectedDateBookings.date ? formatDisplayDate(new Date(selectedDateBookings.date)) : ''}
              </span>
              {selectedDateBookings.bookings.length > 0 && (
                <Button
                  onClick={() => handleDownloadDayCSV(selectedDateBookings.date, selectedDateBookings.bookings)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <FileSpreadsheet size={16} />
                  CSV
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDateBookings.bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nessuna prenotazione per questo giorno
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Totale prenotazioni: {selectedDateBookings.bookings.length} | 
                  Posti totali prenotati: {selectedDateBookings.bookings.reduce((sum, b) => sum + b.seats, 0)}
                </div>
                
                <div className="grid gap-4">
                  {selectedDateBookings.bookings.map((booking, index) => (
                    <Card key={booking.id} className="p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">#{index + 1}</span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Codice: {booking.code}
                            </span>
                          </div>
                          
                          <div>
                            <span className="font-medium">Nome:</span> {booking.name}
                          </div>
                          
                          <div>
                            <span className="font-medium">Telefono:</span> {booking.phone}
                          </div>
                          
                          <div>
                            <span className="font-medium">Email:</span> {booking.email}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">Posti:</span> 
                            <span className="font-bold text-lg">{booking.seats}</span>
                          </div>
                          
                          <div>
                            <span className="font-medium">Data prenotazione:</span> {' '}
                            {new Date(booking.created_at).toLocaleDateString('it-IT', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          
                          {booking.notes && (
                            <div>
                              <span className="font-medium">Note:</span>
                              <div className="bg-gray-50 p-2 rounded mt-1 text-sm">
                                {booking.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTab;
