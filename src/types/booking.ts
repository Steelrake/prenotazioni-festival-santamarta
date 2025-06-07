
export interface Booking {
  id: string;
  date: string;
  seats: number;
  name: string;
  email: string;
  notes?: string;
  code: string;
  createdAt: string;
}

export interface DayAvailability {
  date: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  isSoldOut: boolean;
}
