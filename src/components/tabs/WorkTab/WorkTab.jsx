import React from "react";
import { useGameStore } from "../../../stores/gameStore";
import styles from "./WorkTab.module.scss";

const WorkTab = () => {
  const { player } = useGameStore();

  if (!player.currentJob) {
    return (
      <div className={styles.workTab}>
        <div className={styles.noJob}>
          <h2>💼 No Current Job</h2>
          <p>You need to find a job before you can access work tasks!</p>
          <p>Visit the Jobs tab to browse available positions and apply.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.workTab}>
      <div className={styles.workHeader}>
        <h2>💼 Work - {player.currentJob.title}</h2>
        <p>
          Complete daily work tasks to earn money and build your reputation!
        </p>
      </div>

      <div className={styles.workContent}>
        <div className={styles.placeholder}>
          <h3>🚧 Work Minigames Coming Soon!</h3>
          <p>This is where you'll complete daily work tasks:</p>
          <ul>
            <li>🐛 Bug Hunt - Find and fix code bugs</li>
            <li>🔨 Feature Builder - Assemble code components</li>
            <li>📝 Code Review - Identify code quality issues</li>
          </ul>
          <p>
            For now, you're earning your base salary of $
            {player.currentJob.salary.toLocaleString()}/year automatically!
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkTab;
