const AuditLog = require('../models/AuditLog');

const auditLog = async ({
  req,
  action,
  description,
  actorId = null,
  actorName = null,
  actorRole = null,
  status = 'SUCCESS',
  metadata = {}
}) => {
  try {
    await AuditLog.create({
      action,
      description,
      actorId,
      actorName,
      actorRole,
      status,
      metadata,
      ipAddress: req?.ip || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = auditLog;