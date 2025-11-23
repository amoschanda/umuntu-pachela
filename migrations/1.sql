
CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  profile_image_url TEXT,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  vehicle_color TEXT,
  rating REAL,
  total_rides INTEGER DEFAULT 0,
  is_available INTEGER DEFAULT 0,
  current_latitude REAL,
  current_longitude REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_available ON user_profiles(is_available);

CREATE TABLE rides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rider_id TEXT NOT NULL,
  driver_id TEXT,
  status TEXT NOT NULL,
  pickup_latitude REAL NOT NULL,
  pickup_longitude REAL NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_latitude REAL NOT NULL,
  dropoff_longitude REAL NOT NULL,
  dropoff_address TEXT NOT NULL,
  rider_price REAL,
  driver_price REAL,
  final_price REAL,
  distance_km REAL,
  estimated_duration_minutes INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rides_rider_id ON rides(rider_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);

CREATE TABLE ride_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ride_id INTEGER NOT NULL,
  sender_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ride_messages_ride_id ON ride_messages(ride_id);
