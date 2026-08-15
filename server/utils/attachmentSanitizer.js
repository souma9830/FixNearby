// Whitelist the attachment fields we accept and coerce them to safe values.
// Drops any extra fields sent by the client and rejects malformed payloads.
export const sanitizeAttachment = (attachment) => {
  if (!attachment || typeof attachment !== 'object') return null;

  const fileUrl = typeof attachment.fileUrl === 'string' ? attachment.fileUrl.trim() : '';
  const fileName = typeof attachment.fileName === 'string' ? attachment.fileName.trim() : '';
  const fileType = typeof attachment.fileType === 'string' ? attachment.fileType.trim() : '';
  const fileSize = Number(attachment.fileSize);

  if (!fileUrl || !fileName || !fileType) return null;
  if (!Number.isFinite(fileSize) || fileSize < 0 || fileSize > 10485760) return null;
  if (!fileUrl.startsWith('/uploads/') && !/^https?:\/\//.test(fileUrl)) return null;

  return { fileUrl, fileName, fileType, fileSize };
};
