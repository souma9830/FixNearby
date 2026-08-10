import Issue from '../models/Issue.js';

export class CivicIssueSubmissionController {
  async submitIssueWithGeolocation(req, res) {
    try {
      const { title, description, category, latitude, longitude } = req.body;
      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description required' });
      }

      const issue = await Issue.create({
        userId: req.user._id,
        title,
        description,
        category: category || 'general',
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0]
        },
        status: 'open'
      });

      res.status(201).json({ success: true, issue });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new CivicIssueSubmissionController();
