import express from 'express';
import { JAVA_COURSES } from '../data/coursesData.js';
import { store } from '../services/store.js';

const router = express.Router();

// ── List all courses with per-user purchase & progress status ─────────────────
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'usr_oracle_demo_01';

  const purchases        = store.getUserPurchases(userId);
  const purchasedCourseIds = new Set(purchases.map(p => p.courseId));
  const progressList     = store.getUserLessonProgress(userId);

  const coursesWithStatus = JAVA_COURSES.map(course => {
    const isPurchased      = purchasedCourseIds.has(course.id);
    const completedLessons = progressList.filter(
      lp => lp.courseId === course.id && lp.completed
    ).length;
    const progressPercent  = course.totalLessons > 0
      ? Math.round((completedLessons / course.totalLessons) * 100)
      : 0;
    const isCompleted = isPurchased && progressPercent === 100;

    // Find purchase record for this course
    const purchaseRecord = purchases.find(p => p.courseId === course.id) || null;

    return {
      ...course,
      priceINR:         5.00,
      isPurchased,
      completedLessons,
      progressPercent,
      isCompleted,
      purchasedAt:      purchaseRecord?.purchasedAt || null,
      razorpayPaymentId: purchaseRecord?.razorpayPaymentId || null
    };
  });

  res.json({ courses: coursesWithStatus, totalCourses: JAVA_COURSES.length });
});

// ── Single course details ─────────────────────────────────────────────────────
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const userId   = req.headers['x-user-id'] || req.query.userId || 'usr_oracle_demo_01';

  const course = JAVA_COURSES.find(c => c.slug === slug || String(c.id) === slug);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const purchases   = store.getUserPurchases(userId);
  const isPurchased = purchases.some(p => p.courseId === course.id);
  const purchaseRec = purchases.find(p => p.courseId === course.id) || null;

  const userProgress        = store.getUserLessonProgress(userId, course.id);
  const completedLessonIds  = new Set(userProgress.map(lp => lp.lessonId));
  const completedLessons    = userProgress.filter(lp => lp.completed).length;
  const progressPercent     = course.totalLessons > 0
    ? Math.round((completedLessons / course.totalLessons) * 100)
    : 0;
  const isCompleted = isPurchased && progressPercent === 100;

  const lessons = (course.lessons || []).map(lesson => ({
    ...lesson,
    isLocked:    !isPurchased && !lesson.isFreePreview,
    isCompleted: completedLessonIds.has(lesson.id)
  }));

  res.json({
    ...course,
    priceINR:         5.00,
    isPurchased,
    completedLessons,
    progressPercent,
    isCompleted,
    purchasedAt:      purchaseRec?.purchasedAt || null,
    razorpayPaymentId: purchaseRec?.razorpayPaymentId || null,
    lessons
  });
});

// ── Mark lesson complete ──────────────────────────────────────────────────────
router.post('/complete-lesson', (req, res) => {
  const userId = req.headers['x-user-id'] || req.body?.userId || 'usr_oracle_demo_01';
  const { courseId, lessonId } = req.body;

  if (!courseId || !lessonId) {
    return res.status(400).json({ error: 'courseId and lessonId are required' });
  }

  store.markLessonComplete({ userId, courseId, lessonId });

  // Check if all lessons are now complete → isCompleted
  const course = JAVA_COURSES.find(c => c.id === Number(courseId));
  const isCompleted = course
    ? store.isCourseCompleted(userId, courseId, course.totalLessons)
    : false;

  res.json({ success: true, message: 'Lesson progress saved', isCompleted });
});

export default router;
