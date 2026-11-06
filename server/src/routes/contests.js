import express from 'express';
import { CONTESTS_DATA } from '../data/contestsData.js';
import { ALL_PROBLEMS } from '../data/problemsData.js';
import { executeJavaCode } from '../services/javaRunner.js';

const router = express.Router();

// List contests
router.get('/', (req, res) => {
  const now = new Date();
  const contests = CONTESTS_DATA.map(c => {
    const start = new Date(c.startTime);
    const end = new Date(c.endTime);
    let status = 'UPCOMING';
    if (now >= start && now <= end) {
      status = 'ACTIVE';
    } else if (now > end) {
      status = 'COMPLETED';
    }

    return {
      ...c,
      status,
      nowIso: now.toISOString()
    };
  });

  res.json({ contests });
});

// Single contest details with full problems
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const contest = CONTESTS_DATA.find(c => c.slug === slug || String(c.id) === slug);
  if (!contest) {
    return res.status(404).json({ error: 'Contest not found' });
  }

  // Populate contest problems with full statements & starter codes
  const populatedProblems = contest.problems.map(cp => {
    const fullProb = ALL_PROBLEMS.find(p => p.id === cp.problemId) || {};
    return {
      ...cp,
      description: fullProb.description,
      inputFormat: fullProb.inputFormat,
      outputFormat: fullProb.outputFormat,
      examples: fullProb.examples,
      constraints: fullProb.constraints,
      starterCode: fullProb.starterCode,
      slug: fullProb.slug
    };
  });

  res.json({
    ...contest,
    problems: populatedProblems
  });
});

// Contest submission with strict server-side deadline validation
router.post('/:slug/submit', async (req, res) => {
  try {
    const { slug } = req.params;
    const { problemId, code, username = 'JavaMaster' } = req.body;

    const contest = CONTESTS_DATA.find(c => c.slug === slug);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    // Server-side deadline check
    const now = new Date();
    const endTime = new Date(contest.endTime);
    if (now > endTime) {
      return res.status(400).json({
        error: 'Contest deadline has passed. Submissions are closed for this round.'
      });
    }

    const problem = ALL_PROBLEMS.find(p => p.id === Number(problemId));
    if (!problem) {
      return res.status(404).json({ error: 'Contest problem not found' });
    }

    // Execute Java code
    const result = await executeJavaCode(code, problem.testCases || []);

    // Update contest leaderboard if Accepted
    if (result.status === 'Accepted') {
      const existingEntry = contest.leaderboard.find(e => e.username === username);
      if (existingEntry) {
        existingEntry.solvedCount += 1;
        existingEntry.totalScore += 100;
      } else {
        contest.leaderboard.push({
          rank: contest.leaderboard.length + 1,
          username,
          avatar: '⚡',
          solvedCount: 1,
          totalScore: 100,
          finishTime: 'Just now',
          penalty: 0
        });
      }
    }

    res.json({
      ...result,
      contestId: contest.id,
      timestamp: now.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Contest submission error: ' + err.message });
  }
});

export default router;
