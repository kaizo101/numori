-- Tabelle für Dev-Notizen (Checkliste, geräteübergreifend)
CREATE TABLE IF NOT EXISTS dev_notes (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spalten nachträglich hinzufügen (für Migration bestehender Tabellen)
ALTER TABLE dev_notes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';
ALTER TABLE dev_notes ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'all';
ALTER TABLE dev_notes ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'all';

-- RLS aktivieren
ALTER TABLE dev_notes ENABLE ROW LEVEL SECURITY;

-- Policies nur anlegen wenn nicht vorhanden
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dev_notes' AND policyname='anon_select') THEN
    CREATE POLICY "anon_select" ON dev_notes FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dev_notes' AND policyname='anon_insert') THEN
    CREATE POLICY "anon_insert" ON dev_notes FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dev_notes' AND policyname='anon_update') THEN
    CREATE POLICY "anon_update" ON dev_notes FOR UPDATE TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dev_notes' AND policyname='anon_delete') THEN
    CREATE POLICY "anon_delete" ON dev_notes FOR DELETE TO anon USING (true);
  END IF;
END $$;

-- Bestehende Zeilen mit Default-Werten befüllen
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dev_notes' AND column_name='category') THEN
    UPDATE dev_notes SET category='other', platform='all', theme='all' WHERE category IS NULL;
  END IF;
END $$;
