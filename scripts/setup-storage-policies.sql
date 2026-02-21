-- Políticas para bucket 'products' (imágenes de productos)

-- Permitir lectura pública
CREATE POLICY IF NOT EXISTS "Permitir lectura pública de productos"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Permitir subida solo a usuarios autenticados (service_role)
CREATE POLICY IF NOT EXISTS "Permitir subida a admins"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

-- Permitir eliminar solo a usuarios autenticados
CREATE POLICY IF NOT EXISTS "Permitir eliminar a admins"
ON storage.objects FOR DELETE
USING (bucket_id = 'products');

-- Políticas para bucket 'documents' (fichas técnicas PDF)

-- Permitir lectura pública
CREATE POLICY IF NOT EXISTS "Permitir lectura pública de documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Permitir subida solo a usuarios autenticados
CREATE POLICY IF NOT EXISTS "Permitir subida de documentos a admins"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

-- Permitir eliminar solo a usuarios autenticados
CREATE POLICY IF NOT EXISTS "Permitir eliminar documentos a admins"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents');
