
ALTER TABLE rides ADD COLUMN vehicle_type TEXT DEFAULT 'motorcycle';
ALTER TABLE rides ADD COLUMN scheduled_time TIMESTAMP;
ALTER TABLE rides ADD COLUMN payment_method TEXT DEFAULT 'cash';
ALTER TABLE rides ADD COLUMN rider_rating INTEGER;
ALTER TABLE rides ADD COLUMN driver_rating INTEGER;
ALTER TABLE rides ADD COLUMN rider_feedback TEXT;
ALTER TABLE rides ADD COLUMN driver_feedback TEXT;
