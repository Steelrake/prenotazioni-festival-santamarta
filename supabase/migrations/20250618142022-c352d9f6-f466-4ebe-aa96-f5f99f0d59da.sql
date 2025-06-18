
-- Update the default value for max_seats in the day_settings table
ALTER TABLE public.day_settings ALTER COLUMN max_seats SET DEFAULT 150;

-- Update existing records that still have the old default value of 100
UPDATE public.day_settings SET max_seats = 150 WHERE max_seats = 100;
