-- Création du bucket pour les archives
INSERT INTO storage.buckets (id, name, public) 
VALUES ('observations-archives', 'observations-archives', true)
ON CONFLICT (id) DO NOTHING;

-- Configuration des politiques d'accès (Lecture publique, écriture réservée au service_role)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'observations-archives');
CREATE POLICY "Service Role Access" ON storage.objects FOR ALL USING (bucket_id = 'observations-archives') WITH CHECK (bucket_id = 'observations-archives');
