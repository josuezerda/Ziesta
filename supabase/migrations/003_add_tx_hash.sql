-- Agregar la columna tx_hash a transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(255);

-- Opcionalmente, agregar un índice para búsquedas más rápidas por hash
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(tx_hash);
