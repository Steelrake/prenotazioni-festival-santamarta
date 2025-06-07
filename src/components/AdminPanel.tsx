
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  getBookings, 
  getDayAvailability, 
  updateDaySettings, 
  resetDay,
  getBookingByCode,
  deleteBooking,
  saveBooking
} from '@/utils/storage';
import { getRestaurantDates, formatDisplayDate, generateBookingCode } from '@/utils/dateUtils';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Booking } from '@/types/booking';
import { Lock, Unlock } from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newBooking, setNewBooking] = useState({
    date: '',
    seats: '',
    name: '',
    email: '',
    notes: ''
  });

  const bookings = getBookings();
  const restaurantDates = getRestaurantDates();

  const searchResults = searchTerm ? bookings.filter(booking => 
    booking.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleSoldOut = (date: string, isSoldOut: boolean) => {
    updateDaySettings(date, { isSoldOut });
    toast({
      title: isSoldOut ? "Giorno impostato come SOLD OUT" : "Giorno riaperto",
      description: `${date} è stato aggiornato.`
    });
  };

  const handleMaxSeatsChange = (date: string, maxSeats: number) => {
    updateDaySettings(date, { maxSeats });
    toast({
      title: "Posti massimi aggiornati",
      description: `${date}: ${maxSeats} posti massimi.`
    });
  };

  const handleResetDay = (date: string) => {
    if (confirm(`Sei sicuro di voler resettare il giorno ${date}? Tutte le prenotazioni verranno eliminate.`)) {
      resetDay(date);
      toast({
        title: "Giorno resettato",
        description: `Tutte le prenotazioni del ${date} sono state eliminate.`
      });
    }
  };

  const handleDeleteBooking = (code: string) => {
    if (confirm(`Sei sicuro di voler eliminare la prenotazione ${code}?`)) {
      const success = deleteBooking(code);
      if (success) {
        toast({
          title: "Prenotazione eliminata",
          description: `La prenotazione ${code} è stata eliminata.`
        });
      }
    }
  };

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const booking: Booking = {
        id: crypto.randomUUID(),
        date: newBooking.date,
        seats: parseInt(newBooking.seats),
        name: newBooking.name,
        email: newBooking.email,
        notes: newBooking.notes,
        code: generateBookingCode(),
        createdAt: new Date().toISOString()
      };
      
      saveBooking(booking);
      setNewBooking({ date: '', seats: '', name: '', email: '', notes: '' });
      toast({
        title: "Prenotazione aggiunta",
        description: `Codice: ${booking.code}`
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Pannello Admin</h1>
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="bookings">Prenotazioni</TabsTrigger>
            <TabsTrigger value="search">Ricerca</TabsTrigger>
            <TabsTrigger value="manage">Gestione Giorni</TabsTrigger>
            <TabsTrigger value="add">Aggiungi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <h2 className="text-2xl font-semibold">Panoramica Generale</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurantDates.map((date) => {
                const availability = getDayAvailability(date);
                const dateStr = date.toISOString().split('T')[0];
                
                return (
                  <Card key={dateStr} className="p-4">
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">
                        {formatDisplayDate(date)}
                      </h3>
                      <div className="space-y-2">
                        {availability.isSoldOut ? (
                          <Badge variant="destructive">SOLD OUT</Badge>
                        ) : (
                          <Badge variant="secondary">
                            {availability.availableSeats} liberi
                          </Badge>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {availability.bookedSeats}/{availability.totalSeats} prenotati
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-semibold">Tutte le Prenotazioni ({bookings.length})</h2>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="font-semibold">{booking.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.email} | {booking.seats} posti
                      </div>
                      <div className="text-sm">
                        Data: {formatDisplayDate(new Date(booking.date))}
                      </div>
                      {booking.notes && (
                        <div className="text-sm text-muted-foreground">
                          Note: {booking.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="outline">{booking.code}</Badge>
                      <div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBooking(booking.code)}
                        >
                          Elimina
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <div>
              <Label htmlFor="search">Cerca per codice o nominativo</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Inserisci codice prenotazione o nome cliente..."
                className="mt-2"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Risultati ({searchResults.length})</h3>
                {searchResults.map((booking) => (
                  <Card key={booking.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="font-semibold">{booking.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.email} | {booking.seats} posti
                        </div>
                        <div className="text-sm">
                          Data: {formatDisplayDate(new Date(booking.date))}
                        </div>
                        {booking.notes && (
                          <div className="text-sm text-muted-foreground">
                            Note: {booking.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant="outline">{booking.code}</Badge>
                        <div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBooking(booking.code)}
                          >
                            Elimina
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <h2 className="text-2xl font-semibold">Gestione Giorni</h2>
            <div className="space-y-4">
              {restaurantDates.map((date) => {
                const availability = getDayAvailability(date);
                const dateStr = date.toISOString().split('T')[0];
                
                return (
                  <Card key={dateStr} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{formatDisplayDate(date)}</h3>
                        <div className="text-sm text-muted-foreground">
                          {availability.bookedSeats}/{availability.totalSeats} prenotati
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          value={availability.totalSeats}
                          onChange={(e) => handleMaxSeatsChange(dateStr, parseInt(e.target.value))}
                          className="w-20"
                          min="1"
                        />
                        <Button
                          size="sm"
                          variant={availability.isSoldOut ? "destructive" : "outline"}
                          onClick={() => handleSoldOut(dateStr, !availability.isSoldOut)}
                          className={`min-w-[120px] gap-2 ${
                            availability.isSoldOut 
                              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {availability.isSoldOut ? (
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
                          onClick={() => handleResetDay(dateStr)}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <h2 className="text-2xl font-semibold">Aggiungi Prenotazione Manuale</h2>
            <Card className="p-6">
              <form onSubmit={handleAddBooking} className="space-y-4">
                <div>
                  <Label htmlFor="new-date">Data</Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    min="2025-06-30"
                    max="2025-07-27"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-seats">Numero posti</Label>
                  <Input
                    id="new-seats"
                    type="number"
                    value={newBooking.seats}
                    onChange={(e) => setNewBooking({ ...newBooking, seats: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-name">Nome</Label>
                  <Input
                    id="new-name"
                    value={newBooking.name}
                    onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newBooking.email}
                    onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-notes">Note</Label>
                  <Textarea
                    id="new-notes"
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Aggiungi Prenotazione
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
