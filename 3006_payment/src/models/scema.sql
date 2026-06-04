-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Payments table
CREATE TABLE payments (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                          user_id INTEGER NOT NULL,

                          amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),

                          currency VARCHAR(10) NOT NULL DEFAULT 'USD',

                          status VARCHAR(20) NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

                          transaction_id VARCHAR(255) UNIQUE,

                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);