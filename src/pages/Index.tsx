
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import BookingCalendar from '@/components/BookingCalendar';
import BookingForm from '@/components/BookingForm';
import BookingSuccess from '@/components/BookingSuccess';
import CancelBooking from '@/components/CancelBooking';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';

type ViewType = 'home' | 'calendar' | 'form' | 'success' | 'cancel' | 'admin-login' | 'admin';

const Index: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookingCode, setBookingCode] = useState<string>('');

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentView('form');
  };

  const handleBookingSuccess = (code: string) => {
    setBookingCode(code);
    setCurrentView('success');
  };

  const handleNewBooking = () => {
    setSelectedDate(null);
    setBookingCode('');
    setCurrentView('calendar');
  };

  const resetToHome = () => {
    setCurrentView('home');
    setSelectedDate(null);
    setBookingCode('');
  };

  if (currentView === 'admin') {
    return <AdminPanel onLogout={resetToHome} />;
  }

  if (currentView === 'admin-login') {
    return (
      <AdminLogin 
        onLogin={() => setCurrentView('admin')}
        onBack={resetToHome}
      />
    );
  }

  if (currentView === 'success') {
    return <BookingSuccess code={bookingCode} onNewBooking={handleNewBooking} />;
  }

  if (currentView === 'form' && selectedDate) {
    return (
      <BookingForm 
        date={selectedDate}
        onBack={() => setCurrentView('calendar')}
        onSuccess={handleBookingSuccess}
      />
    );
  }

  if (currentView === 'calendar') {
    return (
      <BookingCalendar 
        onDateSelect={handleDateSelect}
        onBack={resetToHome}
      />
    );
  }

  if (currentView === 'cancel') {
    return <CancelBooking onBack={resetToHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="relative p-6">
        <Button
          onClick={() => setCurrentView('admin-login')}
          variant="ghost"
          size="sm"
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold text-gray-800 mb-6">
              Cene al Festival Santa Marta
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Aperto tutte le sere dalle 19:00 alle 24:00
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Periodo estivo: 30 Giugno - 27 Luglio 2025
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto rounded-full"></div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="space-y-4">
              <Button
                onClick={() => setCurrentView('calendar')}
                size="lg"
                className="w-full h-24 text-2xl font-semibold bg-green-600 hover:bg-green-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                PRENOTA
              </Button>
              <p className="text-sm text-gray-500">
                Seleziona la data e prenota il tuo tavolo
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setCurrentView('cancel')}
                size="lg"
                variant="destructive"
                className="w-full h-24 text-2xl font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                DISDICI
              </Button>
              <p className="text-sm text-gray-500">
                Cancella una prenotazione esistente
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-16 p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Informazioni Utili
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Orari</h4>
                <p className="text-gray-600">Martedì - Domenica: 19:00 - 24:00</p>
                <p className="text-red-500 text-sm">Chiuso tutti i lunedì</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Prenotazioni</h4>
                <p className="text-gray-600">Massimo 100 posti per sera</p>
                <p className="text-gray-600">Prenotazione consigliata</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
