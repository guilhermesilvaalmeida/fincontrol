-- Avatar guardado como data URI (base64) redimensionado no navegador antes do envio,
-- evitando a necessidade de um serviço de storage de arquivos nesta fase do MVP.
ALTER TABLE users ADD COLUMN avatar TEXT;
