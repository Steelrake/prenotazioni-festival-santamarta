
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRestaurantDates, formatDisplayDate } from '@/utils/dateUtils';
import { getDayAvailability } from '@/utils/supabaseStorage';
import { Lock, Unlock, Save } from 'lucide-react';
import { DayAvailability } from '@/types/booking';

interface ManageTabProps {
  onSoldOut: (date: string, isSoldOut: boolean) => void;
  onMaxSeatsChange: (date: string, maxSeats: number) => void;
  onResetDay: (date: string) => void;
}

interface LocalChanges {
  [date: string]: {
    totalSeats?: number;
    isSoldOut?: boolean;
  };
}

const ManageTab = ({ onSoldOut, onMaxSeatsChange, onResetDay }: ManageTabProps) => {
  const [availabilities, setAvailabilities] = useState<Record<string, DayAvailability>>({});
  const [localChanges, setLocalChanges] = useState<LocalChanges>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadAvailabilities();
  }, []);

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
    loadAvailabilities(); // Refresh data
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
      await loadAvailabilities();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = Object.keys(localChanges).length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Gestione Giorni</h2>
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gestione Giorni</h2>
      <div className="space-y-4">
        {restaurantDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const availability = availabilities[dateStr];
          const localChange = localChanges[dateStr];
          
          if (!availability) return null;
          
          // Use local changes if available, otherwise use database values
          const currentTotalSeats = localChange?.totalSeats ?? availability.totalSeats;
          const currentIsSoldOut = localChange?.isSoldOut ?? availability.isSoldOut;
          const hasLocalChanges = localChange !== undefined;
          
          return (
            <Card key={dateStr} className={`p-4 ${hasLocalChanges ? 'border-orange-300 bg-orange-50' : ''}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{formatDisplayDate(date)}</h3>
                  <div className="text-sm text-muted-foreground">
                    {availability.bookedSeats}/{currentTotalSeats} prenotati
                    {hasLocalChanges && (
                      <span className="ml-2 text-orange-600 font-medium">
                        (modifiche non salvate)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
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
                    className="min-w-[120px] gap-2"
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
