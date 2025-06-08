
import { useState, useEffect } from 'react';
import { getRestaurantDates } from '@/utils/dateUtils';
import { getDayAvailability } from '@/utils/supabaseStorage';
import DayCard from './DayCard';
import { DayAvailability } from '@/types/booking';

const OverviewTab = () => {
  const [availabilities, setAvailabilities] = useState<Record<string, DayAvailability>>({});
  const [loading, setLoading] = useState(true);
  const restaurantDates = getRestaurantDates();

  useEffect(() => {
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

    loadAvailabilities();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Panoramica Generale</h2>
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Panoramica Generale</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurantDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const availability = availabilities[dateStr];
          
          if (!availability) return null;
          
          return (
            <DayCard 
              key={dateStr} 
              date={date} 
              availability={availability} 
            />
          );
        })}
      </div>
    </div>
  );
};

export default OverviewTab;
