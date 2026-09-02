-- Todo usuário existente e novo nasce como USER ativo. Ninguém vira ADMIN por esta migration.
-- A promoção do usuário administrador acontece em runtime, via AdminPromotionRunner,
-- lendo a variável de ambiente ADMIN_EMAIL — nunca hardcoded aqui.
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';
ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(60) NOT NULL,
    target_user_id UUID REFERENCES users(id),
    details VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
