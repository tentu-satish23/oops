import express from 'express';
import { executeJavaCode } from '../services/javaRunner.js';
import { ALL_PROBLEMS } from '../data/problemsData.js';
import { store } from '../services/store.js';

const router = express.Router();

// Run Code (Visible + Custom test cases)
router.post('/run', async (req, res) => {
  try {
    const { code, problemSlug, customTestCases } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Java code cannot be empty' });
    }

    const problem = ALL_PROBLEMS.find(p => p.slug === problemSlug);
    let casesToRun = [];

    if (customTestCases && Array.isArray(customTestCases) && customTestCases.length > 0) {
      casesToRun = customTestCases;
    } else if (problem && problem.testCases) {
      // Use visible sample test cases
      casesToRun = problem.testCases.filter(tc => !tc.isHidden);
    } else {
      casesToRun = [{ input: '[1, 2, 3]', expectedOutput: '2' }];
    }

    const executionResult = await executeJavaCode(code, casesToRun, problemSlug || '');
    res.json(executionResult);
  } catch (err) {
    console.error('Run code error:', err);
    res.status(500).json({
      status: 'Runtime Error',
      runtime: 0,
      memory: 0,
      passedTests: 0,
      totalTests: 0,
      errorMessage: err.message
    });
  }
});

// Submit Code (All test cases including hidden, stores to DB)
router.post('/submit', async (req, res) => {
  try {
    const { code, problemSlug, userId = 'usr_oracle_demo_01' } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code cannot be empty' });
    }

    const problem = ALL_PROBLEMS.find(p => p.slug === problemSlug);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Run against ALL test cases (visible + hidden)
    const testCases = problem.testCases && problem.testCases.length > 0
      ? problem.testCases
      : [
          { input: '[2,7,11,15];9', expectedOutput: '[0,1]', isHidden: false },
          { input: '[1,5,8,12,19];20', expectedOutput: '[0,4]', isHidden: true }
        ];

    const result = await executeJavaCode(code, testCases, problemSlug);

    // Save submission to store
    const submissionRecord = store.addSubmission({
      userId,
      problemId: problem.id,
      problemTitle: problem.title,
      problemDifficulty: problem.difficulty,
      language: 'Java',
      code,
      status: result.status,
      runtime: result.runtime,
      memory: result.memory,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      errorMessage: result.errorMessage
    });

    res.json({
      ...result,
      submissionId: submissionRecord.id,
      submittedAt: submissionRecord.submittedAt
    });
  } catch (err) {
    console.error('Submit code error:', err);
    res.status(500).json({
      status: 'Runtime Error',
      runtime: 0,
      memory: 0,
      passedTests: 0,
      totalTests: 0,
      errorMessage: err.message
    });
  }
});

export default router;
