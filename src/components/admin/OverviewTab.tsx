
import { getRestaurantDates } from '@/utils/dateUtils';
import { getDayAvailability } from '@/utils/storage';
import DayCard from './DayCard';

const OverviewTab = () => {
  const restaurantDates = getRestaurantDates();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Panoramica Generale</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurantDates.map((date) => {
          const availability = getDayAvailability(date);
          
          return (
            <DayCard 
              key={date.toISOString().split('T')[0]} 
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
