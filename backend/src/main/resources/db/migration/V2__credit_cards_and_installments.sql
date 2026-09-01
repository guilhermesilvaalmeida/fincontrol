-- Compra no cartão de crédito não afeta saldo de conta corrente até a fatura ser paga
-- (funcionalidade de pagamento de fatura fica para uma próxima fase), então account_id
-- passa a ser opcional: uma transação tem OU account_id OU credit_card_id.
ALTER TABLE transactions ALTER COLUMN account_id DROP NOT NULL;

CREATE TABLE credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(60) NOT NULL,
    bank VARCHAR(60),
    credit_limit NUMERIC(14,2) NOT NULL,
    closing_day INT NOT NULL,
    due_day INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);

CREATE TABLE installment_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credit_card_id UUID NOT NULL REFERENCES credit_cards(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    description VARCHAR(160) NOT NULL,
    total_amount NUMERIC(14,2) NOT NULL,
    installments_count INT NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_installment_purchases_user_id ON installment_purchases(user_id);

ALTER TABLE transactions ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id);
ALTER TABLE transactions ADD COLUMN installment_purchase_id UUID REFERENCES installment_purchases(id);
ALTER TABLE transactions ADD COLUMN installment_number INT;
ALTER TABLE transactions ADD COLUMN installment_total INT;

CREATE INDEX idx_transactions_credit_card_id ON transactions(credit_card_id);
CREATE INDEX idx_transactions_installment_purchase_id ON transactions(installment_purchase_id);
