
export interface Booking {
  id: string;
  date: string;
  seats: number;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  code: string;
  created_at: string;
}

export interface DayAvailability {
  date: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  isSoldOut: boolean;
}
