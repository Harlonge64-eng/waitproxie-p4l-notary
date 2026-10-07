-- =====================================================
-- P4L CUSTOMER DOCUMENT RETENTION AND STORAGE SECURITY
-- =====================================================

-- Keep the existing private customer-documents bucket.
UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
WHERE id = 'customer-documents';

-- Remove the overly broad existing policies.
DROP POLICY IF EXISTS "Authenticated can upload customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete customer documents" ON storage.objects;

-- Customers must still be able to submit documents through the booking form.
CREATE POLICY "Public can upload customer documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'customer-documents');

-- Documents remain private.
-- Only authenticated staff can read them.
CREATE POLICY "Authenticated can read customer documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'customer-documents');

-- Intentionally NO DELETE policy.
-- Browser clients cannot delete customer documents.

-- Add 10-year document retention metadata.
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS document_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS document_retention_until timestamptz,
  ADD COLUMN IF NOT EXISTS document_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS document_deleted_at timestamptz;

-- Establish retention dates for existing uploaded documents.
UPDATE booking_requests
SET
  document_uploaded_at = COALESCE(document_uploaded_at, created_at),
  document_retention_until = COALESCE(
    document_retention_until,
    created_at + INTERVAL '10 years'
  )
WHERE document_url IS NOT NULL
  AND document_url <> '';

-- Automatically establish retention metadata for future documents.
CREATE OR REPLACE FUNCTION set_document_retention_metadata()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.document_url IS NOT NULL
     AND NEW.document_url <> ''
     AND (
       TG_OP = 'INSERT'
       OR OLD.document_url IS NULL
       OR OLD.document_url <> NEW.document_url
     ) THEN

    NEW.document_uploaded_at =
      COALESCE(NEW.document_uploaded_at, now());

    NEW.document_retention_until =
      COALESCE(
        NEW.document_retention_until,
        NEW.document_uploaded_at + INTERVAL '10 years'
      );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_document_retention_metadata
ON booking_requests;

CREATE TRIGGER trg_set_document_retention_metadata
BEFORE INSERT OR UPDATE OF document_url
ON booking_requests
FOR EACH ROW
EXECUTE FUNCTION set_document_retention_metadata();

-- Prevent the retention date from accidentally being shortened.
CREATE OR REPLACE FUNCTION protect_document_retention()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.document_retention_until IS NOT NULL
     AND NEW.document_retention_until IS NOT NULL
     AND NEW.document_retention_until < OLD.document_retention_until THEN

    NEW.document_retention_until = OLD.document_retention_until;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_document_retention
ON booking_requests;

CREATE TRIGGER trg_protect_document_retention
BEFORE UPDATE OF document_retention_until
ON booking_requests
FOR EACH ROW
EXECUTE FUNCTION protect_document_retention();