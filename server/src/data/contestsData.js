export const CONTESTS_DATA = [
  {
    id: 1,
    slug: 'daily-oracle-sprint-141',
    title: 'Daily Oracle Speed Sprint #141',
    description: 'Solve 3 Easy-Medium problems in 45 minutes. Perfect for daily practice.',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 45,
    problems: [
      { problemId: 1, points: 100 },
      { problemId: 5, points: 100 },
      { problemId: 12, points: 150 }
    ],
    leaderboard: [
      { rank: 1, username: 'CodeNinja', avatar: '🔥', solvedCount: 3, totalScore: 350, finishTime: '32m', penalty: 0 },
      { rank: 2, username: 'JavaQueen', avatar: '👑', solvedCount: 3, totalScore: 350, finishTime: '38m', penalty: 0 },
      { rank: 3, username: 'AlgoMaster', avatar: '⚡', solvedCount: 2, totalScore: 250, finishTime: '41m', penalty: 5 }
    ]
  },
  {
    id: 2,
    slug: 'weekly-grand-contest-27',
    title: 'Weekly Grand Contest #27',
    description: '5 problems ranging from Easy to Hard. Compete for the top of the leaderboard.',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 120,
    problems: [
      { problemId: 2, points: 100 },
      { problemId: 8, points: 150 },
      { problemId: 15, points: 200 },
      { problemId: 22, points: 250 },
      { problemId: 30, points: 300 }
    ],
    leaderboard: []
  },
  {
    id: 3,
    slug: 'java-oop-special',
    title: 'Java OOP Special Round',
    description: 'Focus on Object-Oriented Programming concepts with 4 carefully designed problems.',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    problems: [
      { problemId: 3, points: 100 },
      { problemId: 7, points: 150 },
      { problemId: 18, points: 200 },
      { problemId: 25, points: 250 }
    ],
    leaderboard: [
      { rank: 1, username: 'OOPGuru', avatar: '☕', solvedCount: 4, totalScore: 700, finishTime: '67m', penalty: 0 },
      { rank: 2, username: 'JavaMaster', avatar: '🚀', solvedCount: 3, totalScore: 550, finishTime: '78m', penalty: 10 }
    ]
  }
];
