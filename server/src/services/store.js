import crypto from 'crypto';

/**
 * High-performance in-memory state manager for OOP'S ORACLE
 * Holds users, purchases, payment records, submissions, streaks, heatmap data.
 */

const defaultUser = {
  id: 'usr_oracle_demo_01',
  email: 'developer@oopsoracle.com',
  username: 'JavaMaster',
  fullName: 'Alex Vance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  bio: "Mastering Java & LeetCode Hard problems on OOP'S ORACLE.",
  currentStreak: 0,
  longestStreak: 0,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
};

// All in-memory collections — fresh on every server start
const submissions = [];
const coursePurchases = [];    // Confirmed paid & verified purchases
const paymentOrders = [];      // Raw Razorpay orders (pending → captured / failed)
const lessonProgress = [];

const users = [{ ...defaultUser, passwordHash: 'demo123' }];

const userHeatmaps = { usr_oracle_demo_01: {} };

export const store = {
  users,
  submissions,
  coursePurchases,
  paymentOrders,
  lessonProgress,
  userHeatmaps,

  // ── Users ─────────────────────────────────────────────────────────────
  findUserByEmail(email) {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id) {
    return users.find(u => u.id === id);
  },

  createUser({ email, username, fullName, password }) {
    const id = 'usr_' + crypto.randomBytes(6).toString('hex');
    const newUser = {
      id, email, username, fullName,
      passwordHash: password,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bio: "Java Developer preparing for tech interviews on OOP'S ORACLE.",
      currentStreak: 1,
      longestStreak: 1,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    userHeatmaps[id] = { [new Date().toISOString().slice(0, 10)]: 1 };
    return newUser;
  },

  // ── Submissions ───────────────────────────────────────────────────────
  addSubmission(data) {
    const record = {
      id: 'sub_' + crypto.randomBytes(6).toString('hex'),
      ...data,
      submittedAt: new Date().toISOString()
    };
    submissions.push(record);

    // Update heatmap
    const day = record.submittedAt.slice(0, 10);
    if (!userHeatmaps[data.userId]) userHeatmaps[data.userId] = {};
    userHeatmaps[data.userId][day] = (userHeatmaps[data.userId][day] || 0) + 1;

    // Update streak if Accepted
    if (data.status === 'Accepted') {
      const user = this.findUserById(data.userId);
      if (user) {
        user.currentStreak = (user.currentStreak || 0) + 1;
        if (user.currentStreak > (user.longestStreak || 0)) {
          user.longestStreak = user.currentStreak;
        }
      }
    }
    return record;
  },

  getUserSubmissions(userId) {
    return submissions.filter(s => s.userId === userId).sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );
  },

  // ── Course Purchases ──────────────────────────────────────────────────
  hasPurchasedCourse(userId, courseId) {
    return coursePurchases.some(p => p.userId === userId && p.courseId === Number(courseId));
  },

  getUserPurchases(userId) {
    return coursePurchases.filter(p => p.userId === userId);
  },

  addCoursePurchase({ userId, courseId, amount, razorpayPaymentId, razorpayOrderId, isSimulation }) {
    const purchase = {
      id: 'pur_' + crypto.randomBytes(6).toString('hex'),
      userId,
      courseId: Number(courseId),
      amount: Number(amount) || 5.00,
      currency: 'INR',
      razorpayPaymentId: razorpayPaymentId || null,
      razorpayOrderId: razorpayOrderId || null,
      isSimulation: !!isSimulation,
      status: 'captured',
      purchasedAt: new Date().toISOString()
    };
    coursePurchases.push(purchase);
    return purchase;
  },

  // ── Payment Orders ────────────────────────────────────────────────────
  createPaymentOrder(data) {
    const order = {
      id: 'ord_' + crypto.randomBytes(6).toString('hex'),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    paymentOrders.push(order);
    return order;
  },

  getPaymentOrderByRzpId(rzpOrderId) {
    return paymentOrders.find(o => o.razorpayOrderId === rzpOrderId);
  },

  updatePaymentOrderStatus(rzpOrderId, status, paymentId) {
    const order = this.getPaymentOrderByRzpId(rzpOrderId);
    if (order) {
      order.status = status;
      if (paymentId) order.razorpayPaymentId = paymentId;
    }
    return order;
  },

  // ── Lesson Progress ───────────────────────────────────────────────────
  markLessonComplete({ userId, courseId, lessonId }) {
    const existing = lessonProgress.find(
      lp => lp.userId === userId && lp.lessonId === Number(lessonId)
    );
    if (!existing) {
      lessonProgress.push({
        userId,
        courseId: Number(courseId),
        lessonId: Number(lessonId),
        completed: true,
        completedAt: new Date().toISOString()
      });
    }
    return { success: true };
  },

  getUserLessonProgress(userId, courseId) {
    return lessonProgress.filter(
      lp => lp.userId === userId && (!courseId || lp.courseId === Number(courseId))
    );
  },

  isCourseCompleted(userId, courseId, totalLessons) {
    if (!totalLessons || totalLessons === 0) return false;
    const completedCount = lessonProgress.filter(
      lp => lp.userId === userId && lp.courseId === Number(courseId) && lp.completed
    ).length;
    return completedCount >= totalLessons;
  },

  // ── Heatmap ───────────────────────────────────────────────────────────
  getUserHeatmap(userId) {
    if (!userHeatmaps[userId]) userHeatmaps[userId] = {};
    return userHeatmaps[userId];
  }
};
