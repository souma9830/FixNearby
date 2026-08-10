export class DisputeEvidenceSanitizerService {
  static sanitizeAttachments(files = []) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    return files.filter(file => {
      return allowedMimeTypes.includes(file.mimetype) && file.size <= 5 * 1024 * 1024;
    });
  }
}

export default DisputeEvidenceSanitizerService;
