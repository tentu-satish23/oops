import express from 'express';
import { store } from '../services/store.js';
import { ALL_PROBLEMS } from '../data/problemsData.js';
import { JAVA_COURSES } from '../data/coursesData.js';

const router = express.Router();

// GET /api/profile/:userId
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const user = store.findUserById(userId) || store.findUserById('usr_oracle_demo_01');

  if (!user) return res.status(404).json({ error: 'User profile not found' });

  const submissions   = store.getUserSubmissions(user.id);
  const acceptedSubs  = submissions.filter(s => s.status === 'Accepted');
  const solvedProblemIds = new Set(acceptedSubs.map(s => s.problemId));
  const solvedProblems   = ALL_PROBLEMS.filter(p => solvedProblemIds.has(p.id));

  const easySolved   = solvedProblems.filter(p => p.difficulty === 'Easy').length;
  const mediumSolved = solvedProblems.filter(p => p.difficulty === 'Medium').length;
  const hardSolved   = solvedProblems.filter(p => p.difficulty === 'Hard').length;
  const totalSubmissions = submissions.length;
  const acceptanceRate = totalSubmissions > 0
    ? Number(((acceptedSubs.length / totalSubmissions) * 100).toFixed(1))
    : 0;

  const heatmap = store.getUserHeatmap(user.id);

  // ── Enrolled Courses: include real progress + purchase details ─────────
  const purchases      = store.getUserPurchases(user.id);
  const progressList   = store.getUserLessonProgress(user.id);

  const enrolledCourses = JAVA_COURSES
    .filter(c => purchases.some(p => p.courseId === c.id))
    .map(course => {
      const purchaseRec      = purchases.find(p => p.courseId === course.id);
      const completedLessons = progressList.filter(
        lp => lp.courseId === course.id && lp.completed
      ).length;
      const progressPercent = course.totalLessons > 0
        ? Math.round((completedLessons / course.totalLessons) * 100)
        : 0;
      const isCompleted = progressPercent === 100;

      return {
        id:                course.id,
        slug:              course.slug,
        title:             course.title,
        description:       course.description,
        totalLessons:      course.totalLessons,
        estimatedDuration: course.estimatedDuration,
        difficulty:        course.difficulty,
        completedLessons,
        progressPercent,
        isCompleted,
        purchasedAt:         purchaseRec?.purchasedAt    || null,
        razorpayPaymentId:   purchaseRec?.razorpayPaymentId || null,
        razorpayOrderId:     purchaseRec?.razorpayOrderId   || null,
      };
    });

  const contestHistory = [
    {
      contestName: 'Daily Oracle Speed Sprint #141',
      contestType: 'Daily',
      rank: 4,
      score: 100,
      participationDate: new Date(Date.now() - 86400000).toLocaleDateString()
    },
    {
      contestName: 'Weekly Grand Contest #27',
      contestType: 'Weekly',
      rank: 24,
      score: 1400,
      participationDate: new Date(Date.now() - 604800000).toLocaleDateString()
    }
  ];

  res.json({
    profile: {
      id:            user.id,
      fullName:      user.fullName,
      username:      user.username,
      email:         user.email,
      avatarUrl:     user.avatarUrl,
      bio:           user.bio,
      createdAt:     user.createdAt,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak
    },
    stats: {
      totalSolved: solvedProblemIds.size,
      easySolved,
      mediumSolved,
      hardSolved,
      totalSubmissions,
      acceptanceRate
    },
    heatmap,
    submissionHistory: submissions.slice(0, 50),
    enrolledCourses,
    contestHistory
  });
});

// PUT /api/profile/:userId
router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  const { fullName, bio, avatarUrl } = req.body;

  const user = store.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (fullName)          user.fullName  = fullName;
  if (bio !== undefined) user.bio       = bio;
  if (avatarUrl)         user.avatarUrl = avatarUrl;

  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

export default router;
