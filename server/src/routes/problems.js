import express from 'express';
import { ALL_PROBLEMS, TOPICS, COMPANIES } from '../data/problemsData.js';
import { store } from '../services/store.js';

const router = express.Router();

// List problems with rich filtering, search, sorting, and pagination
router.get('/', (req, res) => {
  let {
    page = 1,
    limit = 25,
    difficulty,
    topic,
    status,
    search,
    sortBy = 'id',
    order = 'asc',
    userId = req.headers['x-user-id'] || 'usr_oracle_demo_01'
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  // Get user's solved problems
  const userSubs = store.getUserSubmissions(userId);
  const solvedProblemIds = new Set(
    userSubs.filter(s => s.status === 'Accepted').map(s => s.problemId)
  );

  let filtered = ALL_PROBLEMS.map(p => ({
    ...p,
    isSolved: solvedProblemIds.has(p.id)
  }));

  // Filter: Search
  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      String(p.id) === q ||
      p.companyTags?.some(c => c.toLowerCase().includes(q))
    );
  }

  // Filter: Difficulty
  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  // Filter: Topic
  if (topic && topic !== 'All') {
    filtered = filtered.filter(p => p.topic.toLowerCase() === topic.toLowerCase());
  }

  // Filter: Status (Solved / Unsolved)
  if (status && status !== 'All') {
    if (status === 'Solved') {
      filtered = filtered.filter(p => p.isSolved);
    } else if (status === 'Unsolved') {
      filtered = filtered.filter(p => !p.isSolved);
    }
  }

  // Sorting
  filtered.sort((a, b) => {
    let fieldA = a[sortBy];
    let fieldB = b[sortBy];

    if (sortBy === 'difficulty') {
      const orderMap = { Easy: 1, Medium: 2, Hard: 3 };
      fieldA = orderMap[a.difficulty] || 0;
      fieldB = orderMap[b.difficulty] || 0;
    }

    if (order === 'desc') {
      return fieldA > fieldB ? -1 : 1;
    }
    return fieldA > fieldB ? 1 : -1;
  });

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // Compute overall metadata
  const stats = {
    totalProblems: ALL_PROBLEMS.length,
    easyCount: ALL_PROBLEMS.filter(p => p.difficulty === 'Easy').length,
    mediumCount: ALL_PROBLEMS.filter(p => p.difficulty === 'Medium').length,
    hardCount: ALL_PROBLEMS.filter(p => p.difficulty === 'Hard').length,
    userSolvedTotal: solvedProblemIds.size
  };

  res.json({
    problems: paginated,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      limit
    },
    topics: TOPICS,
    companies: COMPANIES,
    stats
  });
});

// Pick a random problem
router.get('/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * ALL_PROBLEMS.length);
  const randomProblem = ALL_PROBLEMS[randomIndex];
  res.json({ slug: randomProblem.slug, id: randomProblem.id });
});

// Get single problem by slug or ID
router.get('/:identifier', (req, res) => {
  const { identifier } = req.params;
  const userId = req.headers['x-user-id'] || req.query.userId || 'usr_oracle_demo_01';

  const problem = ALL_PROBLEMS.find(
    p => p.slug === identifier || String(p.id) === identifier
  );

  if (!problem) {
    return res.status(404).json({ error: 'Problem not found in OOP\'S ORACLE library' });
  }

  // Get user's submissions for this specific problem
  const userSubs = store.getUserSubmissions(userId)
    .filter(s => s.problemId === problem.id);

  // Return problem details (never reveal isHidden=true test cases)
  const safeTestCases = (problem.testCases || [])
    .filter(tc => !tc.isHidden)
    .map(({ isHidden, ...rest }) => rest);

  res.json({
    ...problem,
    testCases: safeTestCases,
    isSolved: userSubs.some(s => s.status === 'Accepted'),
    userSubmissions: userSubs
  });
});

export default router;
