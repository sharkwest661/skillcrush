import { create } from "zustand";

export const useGameStore = create((set, get) => ({
  // Player State
  player: {
    level: 1,
    xp: 0,
    xpToNext: 100,
    money: 1000,
    reputation: 0,
    currentJob: null,
    skills: {}, // learned skills object
    skillPoints: {
      red: 0, // Analytical
      green: 0, // Creativity
      blue: 0, // Systems
      yellow: 0, // Communication
      purple: 0, // Technical
      orange: 0, // Business
      pink: 0, // Teamwork
      cyan: 0, // Presentation
    },
  },

  // Game State
  currentTab: "learning",
  gameDate: new Date("2024-01-01"),
  notifications: [],
  achievements: [],
  gameSpeed: 1, // Time multiplier (1 second = 1 day by default)

  // Inventory & Lifestyle
  inventory: {
    housing: "studio",
    transport: "walking",
    tech: ["basic-laptop"],
    lifestyle: [],
  },

  // Game Statistics
  stats: {
    totalSkillsLearned: 0,
    totalJobsCompleted: 0,
    totalMoneyEarned: 0,
    bestWorkStreak: 0,
    currentWorkStreak: 0,
  },

  // Actions
  setCurrentTab: (tab) => set({ currentTab: tab }),

  // XP and Level Management
  addXP: (amount) =>
    set((state) => {
      const newXP = state.player.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const xpToNext = newLevel * 100 - newXP;

      if (newLevel > state.player.level) {
        // Level up notification
        get().addNotification({
          type: "success",
          title: "Level Up!",
          message: `You reached level ${newLevel}!`,
          duration: 3000,
        });
      }

      return {
        player: {
          ...state.player,
          xp: newXP,
          level: newLevel,
          xpToNext: xpToNext,
        },
      };
    }),

  // Money Management
  addMoney: (amount) =>
    set((state) => {
      const newAmount = state.player.money + amount;
      return {
        player: { ...state.player, money: newAmount },
        stats: {
          ...state.stats,
          totalMoneyEarned: state.stats.totalMoneyEarned + amount,
        },
      };
    }),

  spendMoney: (amount) =>
    set((state) => {
      if (state.player.money >= amount) {
        return {
          player: { ...state.player, money: state.player.money - amount },
        };
      }
      return state;
    }),

  canAfford: (amount) => {
    return get().player.money >= amount;
  },

  // Skill Points Management
  addSkillPoints: (colorId, amount) =>
    set((state) => ({
      player: {
        ...state.player,
        skillPoints: {
          ...state.player.skillPoints,
          [colorId]: state.player.skillPoints[colorId] + amount,
        },
      },
    })),

  spendSkillPoints: (costs) =>
    set((state) => {
      const newSkillPoints = { ...state.player.skillPoints };

      // Check if we have enough points
      for (const [colorId, amount] of Object.entries(costs)) {
        if (newSkillPoints[colorId] < amount) {
          return state; // Not enough points
        }
      }

      // Spend the points
      for (const [colorId, amount] of Object.entries(costs)) {
        newSkillPoints[colorId] -= amount;
      }

      return {
        player: {
          ...state.player,
          skillPoints: newSkillPoints,
        },
      };
    }),

  // Skill Learning
  learnSkill: (skillName, skillData) =>
    set((state) => {
      if (state.player.skills[skillName]) {
        return state; // Already learned
      }

      // Check prerequisites
      const prereqsMet = skillData.prereqs.every(
        (prereq) => state.player.skills[prereq]
      );
      if (!prereqsMet) {
        return state;
      }

      // Check skill point costs
      const costs = {};
      Object.keys(skillData).forEach((key) => {
        if (
          ![
            "prereqs",
            "category",
            "earnings",
            "description",
            "difficulty",
          ].includes(key)
        ) {
          costs[key] = skillData[key];
        }
      });

      // Try to spend skill points
      const canSpend = Object.entries(costs).every(
        ([colorId, amount]) => state.player.skillPoints[colorId] >= amount
      );

      if (!canSpend) {
        return state;
      }

      // Learn the skill
      const newSkillPoints = { ...state.player.skillPoints };
      Object.entries(costs).forEach(([colorId, amount]) => {
        newSkillPoints[colorId] -= amount;
      });

      // Add XP for learning skill
      const skillXP =
        Object.values(costs).reduce((sum, cost) => sum + cost, 0) * 5;

      get().addXP(skillXP);
      get().addNotification({
        type: "success",
        title: "Skill Learned!",
        message: `You learned ${skillName}!`,
        duration: 2000,
      });

      return {
        player: {
          ...state.player,
          skills: { ...state.player.skills, [skillName]: true },
          skillPoints: newSkillPoints,
        },
        stats: {
          ...state.stats,
          totalSkillsLearned: state.stats.totalSkillsLearned + 1,
        },
      };
    }),

  // Job Management
  setCurrentJob: (job) =>
    set((state) => ({
      player: { ...state.player, currentJob: job },
    })),

  // Reputation Management
  addReputation: (amount) =>
    set((state) => ({
      player: {
        ...state.player,
        reputation: Math.max(0, state.player.reputation + amount),
      },
    })),

  // Notification System
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now() + Math.random(),
          timestamp: Date.now(),
          ...notification,
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  // Time Management
  advanceTime: (days = 1) =>
    set((state) => {
      const newDate = new Date(state.gameDate);
      newDate.setDate(newDate.getDate() + days);
      return { gameDate: newDate };
    }),

  setGameSpeed: (speed) => set({ gameSpeed: speed }),

  // Achievement System
  unlockAchievement: (achievement) =>
    set((state) => {
      if (state.achievements.find((a) => a.id === achievement.id)) {
        return state; // Already unlocked
      }

      get().addNotification({
        type: "achievement",
        title: "Achievement Unlocked!",
        message: achievement.name,
        duration: 4000,
      });

      return {
        achievements: [
          ...state.achievements,
          { ...achievement, unlockedAt: Date.now() },
        ],
      };
    }),

  // Inventory Management
  addToInventory: (category, item) =>
    set((state) => {
      const newInventory = { ...state.inventory };

      if (Array.isArray(newInventory[category])) {
        newInventory[category] = [...newInventory[category], item];
      } else {
        newInventory[category] = item;
      }

      return { inventory: newInventory };
    }),

  // Work Performance
  updateWorkStreak: (isGoodDay) =>
    set((state) => {
      const newStreak = isGoodDay ? state.stats.currentWorkStreak + 1 : 0;
      const bestStreak = Math.max(state.stats.bestWorkStreak, newStreak);

      return {
        stats: {
          ...state.stats,
          currentWorkStreak: newStreak,
          bestWorkStreak: bestStreak,
        },
      };
    }),

  // Reset Game (for testing/development)
  resetGame: () =>
    set((state) => ({
      player: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        money: 1000,
        reputation: 0,
        currentJob: null,
        skills: {},
        skillPoints: {
          red: 0,
          green: 0,
          blue: 0,
          yellow: 0,
          purple: 0,
          orange: 0,
          pink: 0,
          cyan: 0,
        },
      },
      currentTab: "learning",
      gameDate: new Date("2024-01-01"),
      notifications: [],
      achievements: [],
      inventory: {
        housing: "studio",
        transport: "walking",
        tech: ["basic-laptop"],
        lifestyle: [],
      },
      stats: {
        totalSkillsLearned: 0,
        totalJobsCompleted: 0,
        totalMoneyEarned: 0,
        bestWorkStreak: 0,
        currentWorkStreak: 0,
      },
    })),
}));
