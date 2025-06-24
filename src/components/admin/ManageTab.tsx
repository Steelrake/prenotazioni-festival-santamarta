
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { getRestaurantDates, formatDisplayDate } from '@/utils/dateUtils';
import { Lock, Unlock, Save, Download, Users, UserCheck } from 'lucide-react';
import { DayAvailability } from '@/types/booking';
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
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <UserCheck className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Prenotati</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {availability.bookedSeats}
                      </div>
                      <div className="text-xs text-red-600">
                        posti occupati
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
    </div>
  );
};

export default ManageTab;
