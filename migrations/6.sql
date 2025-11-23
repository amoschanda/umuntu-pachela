
CREATE TABLE payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ride_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  amount REAL NOT NULL,
  phone_number TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL,
  response_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_transactions_ride_id ON payment_transactions(ride_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
