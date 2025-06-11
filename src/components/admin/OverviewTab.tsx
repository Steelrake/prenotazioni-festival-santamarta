
import { getRestaurantDates } from '@/utils/dateUtils';
import DayCard from './DayCard';
import { DayAvailability } from '@/types/booking';

interface OverviewTabProps {
  availabilities: Record<string, DayAvailability>;
}

const OverviewTab = ({ availabilities }: OverviewTabProps) => {
  const restaurantDates = getRestaurantDates();

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
