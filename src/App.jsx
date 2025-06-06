import React, { useEffect } from "react";
import { useGameStore } from "./stores/gameStore";
import GameHeader from "./components/layout/GameHeader/GameHeader";
import TabNavigation from "./components/layout/TabNavigation/TabNavigation";
import LearningTab from "./components/tabs/LearningTab/LearningTab";
import WorkTab from "./components/tabs/WorkTab/WorkTab";
import JobsTab from "./components/tabs/JobsTab/JobsTab";
import LifeTab from "./components/tabs/LifeTab/LifeTab";
import NotificationSystem from "./components/layout/NotificationSystem/NotificationSystem";
import styles from "./App.module.scss";

const App = () => {
  const {
    currentTab,
    setCurrentTab,
    player,
    gameDate,
    notifications,
    advanceTime,
    gameSpeed,
  } = useGameStore();

  // Game time progression - 1 second = 1 game day
  useEffect(() => {
    const interval = setInterval(() => {
      advanceTime(1);
    }, 1000 / gameSpeed);

    return () => clearInterval(interval);
  }, [advanceTime, gameSpeed]);

  // Daily earnings from learned skills (if employed)
  useEffect(() => {
    const interval = setInterval(() => {
      if (player.currentJob) {
        // Calculate daily earnings based on learned skills and job
        const baseSalary = player.currentJob.salary / 365; // Daily salary
        const performanceMultiplier = 1.0; // Will be affected by work minigames later

        const dailyEarnings = Math.floor(baseSalary * performanceMultiplier);

        if (dailyEarnings > 0) {
          useGameStore.getState().addMoney(dailyEarnings);
        }
      }
    }, 1000 / gameSpeed); // Every game day

    return () => clearInterval(interval);
  }, [player.currentJob, gameSpeed]);

  const tabs = [
    {
      id: "learning",
      emoji: "🎮",
      label: "Learning",
      available: true,
      description: "Play SkillCrush to learn new skills",
    },
    {
      id: "work",
      emoji: "💼",
      label: "Work",
      available: !!player.currentJob,
      description: "Complete work tasks and earn money",
    },
    {
      id: "jobs",
      emoji: "📋",
      label: "Jobs",
      available: true,
      description: "Find and apply for new positions",
    },
    {
      id: "life",
      emoji: "🏠",
      label: "Life",
      available: true,
      description: "Purchase items to improve your lifestyle",
    },
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case "learning":
        return <LearningTab />;
      case "work":
        return player.currentJob ? <WorkTab /> : <JobRequiredMessage />;
      case "jobs":
        return <JobsTab />;
      case "life":
        return <LifeTab />;
      default:
        return <LearningTab />;
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.appContainer}>
        <GameHeader />

        <TabNavigation
          tabs={tabs}
          activeTab={currentTab}
          onTabChange={setCurrentTab}
        />

        <main className={styles.content}>{renderTabContent()}</main>

        <NotificationSystem notifications={notifications} />
      </div>
    </div>
  );
};

// Component to show when work tab is accessed without a job
const JobRequiredMessage = () => (
  <div className={styles.jobRequired}>
    <div className={styles.jobRequiredContent}>
      <h2>💼 No Current Job</h2>
      <p>You need to find a job before you can access work tasks!</p>
      <p>
        Visit the <strong>Jobs</strong> tab to browse available positions and
        apply.
      </p>
      <div className={styles.jobRequiredTips}>
        <h3>💡 Getting Started Tips:</h3>
        <ul>
          <li>
            Learn basic skills like HTML, CSS, and JavaScript in the Learning
            tab
          </li>
          <li>
            Look for "Junior" or "Entry-level" positions that match your skills
          </li>
          <li>
            Don't worry if you don't meet every requirement - apply anyway!
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default App;
