import express from 'express';
import { ALL_CONTESTS } from '../data/contestsData.js';
import { store } from '../services/store.js';

const router = express.Router();

// Get all contests
router.get('/', (req, res) => {
  const contests = ALL_CONTESTS.map(c => ({
    ...c,
    // hide problem details for list view if needed
  }));
  res.json({ contests });
});

// Get single contest by slug
router.get('/:slug', (req, res) => {
  const contest = ALL_CONTESTS.find(c => c.slug === req.params.slug);
  if (!contest) {
    return res.status(404).json({ error: 'Contest not found' });
  }
  res.json(contest);
});

// Submit to contest
router.post('/:slug/submit', (req, res) => {
  const { problemId, code, username } = req.body;
  const contest = ALL_CONTESTS.find(c => c.slug === req.params.slug);
  if (!contest) {
    return res.status(404).json({ error: 'Contest not found' });
  }

  // Simple scoring simulation
  const score = Math.floor(Math.random() * 100) + 50;
  const result = {
    success: true,
    score,
    message: 'Submission recorded',
    username: username || 'Anonymous'
  };

  res.json(result);
});

export default router;
