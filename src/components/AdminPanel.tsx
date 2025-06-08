
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateDaySettings, resetDay, deleteBooking } from '@/utils/storage';
import { toast } from '@/hooks/use-toast';
import OverviewTab from './admin/OverviewTab';
import BookingsTab from './admin/BookingsTab';
import SearchTab from './admin/SearchTab';
import ManageTab from './admin/ManageTab';
import AddBookingTab from './admin/AddBookingTab';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
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

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab onDeleteBooking={handleDeleteBooking} />
          </TabsContent>

          <TabsContent value="search">
            <SearchTab onDeleteBooking={handleDeleteBooking} />
          </TabsContent>

          <TabsContent value="manage">
            <ManageTab 
              onSoldOut={handleSoldOut}
              onMaxSeatsChange={handleMaxSeatsChange}
              onResetDay={handleResetDay}
            />
          </TabsContent>

          <TabsContent value="add">
            <AddBookingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
