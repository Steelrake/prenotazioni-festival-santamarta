import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateDaySettings, resetDay, deleteBooking } from '@/utils/supabaseStorage';
import { toast } from '@/hooks/use-toast';
import { useAdminData } from '@/hooks/useAdminData';
import OverviewTab from './admin/OverviewTab';
import BookingsTab from './admin/BookingsTab';
import SearchTab from './admin/SearchTab';
import ManageTab from './admin/ManageTab';
import AddBookingTab from './admin/AddBookingTab';
import ExportTab from './admin/ExportTab';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const adminData = useAdminData();

  useEffect(() => {
    console.log('AdminPanel mounted, adminData state:', {
      loading: adminData.loading,
      initialized: adminData.initialized,
      bookingsCount: adminData.bookings.length,
      availabilitiesCount: Object.keys(adminData.availabilities).length
    });

    if (!adminData.initialized && !adminData.loading) {
      console.log('Loading admin data...');
      adminData.loadAllData();
    }
  }, [adminData.initialized, adminData.loading]);

  const handleSoldOut = async (date: string, isSoldOut: boolean) => {
    await updateDaySettings(date, { isSoldOut });
    adminData.updateDaySettingsLocal(date, { isSoldOut });
    toast({
      title: isSoldOut ? "Giorno impostato come SOLD OUT" : "Giorno riaperto",
      description: `${date} è stato aggiornato.`
    });
  };

  const handleMaxSeatsChange = async (date: string, maxSeats: number) => {
    await updateDaySettings(date, { maxSeats });
    adminData.updateDaySettingsLocal(date, { maxSeats });
    toast({
      title: "Posti massimi aggiornati",
      description: `${date}: ${maxSeats} posti massimi.`
    });
  };

  const handleResetDay = async (date: string) => {
    if (confirm(`Sei sicuro di voler resettare il giorno ${date}? Tutte le prenotazioni verranno eliminate.`)) {
      await resetDay(date);
      await adminData.refreshData();
      toast({
        title: "Giorno resettato",
        description: `Tutte le prenotazioni del ${date} sono state eliminate.`
      });
    }
  };

  const handleDeleteBooking = async (code: string) => {
    if (confirm(`Sei sicuro di voler eliminare la prenotazione ${code}?`)) {
      const success = await deleteBooking(code);
      if (success) {
        adminData.removeBooking(code);
        toast({
          title: "Prenotazione eliminata",
          description: `La prenotazione ${code} è stata eliminata.`
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione.",
          variant: "destructive"
        });
      }
    }
  };

  const handleBookingAdded = () => {
    adminData.refreshData();
  };

  const handleManageTabSave = () => {
    adminData.refreshData();
  };

  if (adminData.loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Caricamento pannello admin...</h2>
            <div className="text-muted-foreground">Attendere prego...</div>
          </div>
        </div>
      </div>
    );
  }

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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="bookings">Prenotazioni</TabsTrigger>
            <TabsTrigger value="search">Ricerca</TabsTrigger>
            <TabsTrigger value="manage">Gestione Giorni</TabsTrigger>
            <TabsTrigger value="add">Aggiungi</TabsTrigger>
            <TabsTrigger value="export">Esporta</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab availabilities={adminData.availabilities} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab bookings={adminData.bookings} onDeleteBooking={handleDeleteBooking} />
          </TabsContent>

          <TabsContent value="search">
            <SearchTab bookings={adminData.bookings} onDeleteBooking={handleDeleteBooking} />
          </TabsContent>

          <TabsContent value="manage">
            <ManageTab 
              availabilities={adminData.availabilities}
              daySettings={adminData.daySettings}
              onSoldOut={handleSoldOut}
              onMaxSeatsChange={handleMaxSeatsChange}
              onResetDay={handleResetDay}
              onSave={handleManageTabSave}
            />
          </TabsContent>

          <TabsContent value="add">
            <AddBookingTab onBookingAdded={handleBookingAdded} />
          </TabsContent>

          <TabsContent value="export">
            <ExportTab bookings={adminData.bookings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
