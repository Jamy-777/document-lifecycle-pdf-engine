
CREATE TRIGGER prevent_audit_log_update
BEFORE UPDATE ON audit_logs
BEGIN
  SELECT RAISE(
    ABORT,
    'Audit logs are immutable and cannot be updated'
  );
END;

CREATE TRIGGER prevent_audit_log_delete
BEFORE DELETE ON audit_logs
BEGIN
  SELECT RAISE(
    ABORT,
    'Audit logs are immutable and cannot be deleted'
  );
END;