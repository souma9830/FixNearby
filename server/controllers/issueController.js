import Issue from '../models/Issue.js';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// In-memory fallback store when DB is not connected
const inMemoryIssues = [];

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

export const getNearbyIssues = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const category = req.query.category;
    const radiusKm = parseFloat(req.query.radius) || 1; // default 1 km

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    const maxDistanceMeters = Math.max(10, Math.min(50000, radiusKm * 1000));

    if (isDbConnected()) {
      const issues = await Issue.find({
        category,
        status: { $nin: ['resolved', 'closed'] },
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistanceMeters
          }
        }
      }).limit(100);

      return res.status(200).json(issues);
    }

    // Fallback: filter in-memory
    const results = inMemoryIssues.filter((it) => {
      if (!it.latitude || !it.longitude) return false;
      if (category && it.category !== category) return false;
      if (it.status && ['resolved', 'closed'].includes(it.status)) return false;
      // rough distance via Pythagorean for small radii (approx)
      const dLat = (it.latitude - lat) * 111000;
      const dLon = (it.longitude - lng) * 111000 * Math.cos((lat * Math.PI) / 180);
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      return dist <= maxDistanceMeters;
    });

    return res.status(200).json(results);
  } catch (err) {
    console.error('getNearbyIssues error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createIssue = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;

    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let thumbnailUrl = null;
    if (req.file) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      thumbnailUrl = `/uploads/${req.file.filename}`;
    }

    if (isDbConnected()) {
      const issue = await Issue.create({
        title,
        description,
        category,
        latitude: Number(latitude),
        longitude: Number(longitude),
        thumbnailUrl,
        reportedBy: req.user ? req.user.id : null
      });
      return res.status(201).json(issue);
    }

    // Fallback create in memory
    const id = new Date().getTime().toString();
    const issue = {
      id,
      title,
      description,
      category,
      latitude: Number(latitude),
      longitude: Number(longitude),
      thumbnailUrl,
      status: 'open',
      upvotes: 0,
      reportedBy: null,
      reportedAt: new Date()
    };
    inMemoryIssues.push(issue);
    return res.status(201).json(issue);
  } catch (err) {
    console.error('createIssue error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const upvoteIssue = async (req, res) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      const issue = await Issue.findById(id);
      if (!issue) return res.status(404).json({ message: 'Issue not found' });
      issue.upvotes = (issue.upvotes || 0) + 1;
      await issue.save();
      return res.status(200).json(issue);
    }

    // in-memory
    const issue = inMemoryIssues.find((it) => String(it.id) === String(id));
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    issue.upvotes = (issue.upvotes || 0) + 1;
    return res.status(200).json(issue);
  } catch (err) {
    console.error('upvoteIssue error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const id = req.params.id;
    if (isDbConnected()) {
      const issue = await Issue.findById(id);
      if (!issue) return res.status(404).json({ message: 'Issue not found' });
      return res.status(200).json(issue);
    }

    const issue = inMemoryIssues.find((it) => String(it.id) === String(id));
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    return res.status(200).json(issue);
  } catch (err) {
    console.error('getIssueById error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        
        const issue = await Issue.findById(id);
        if (!issue) return res.status(404).json({ message: "Issue not found" });

        // Logic: Calculate ETA if moving to in-progress
        if (status === 'in-progress' && issue.status !== 'in-progress') {
            issue.estimatedArrival = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
        }

        issue.status = status;
        issue.statusHistory.push({ status, updatedAt: new Date(), note });
        await issue.save();

        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};