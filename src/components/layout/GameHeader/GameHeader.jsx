import React from "react";
import { useGameStore } from "../../../stores/gameStore";
import styles from "./GameHeader.module.scss";

const GameHeader = () => {
  const { player, gameDate } = useGameStore();

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getXPPercentage = () => {
    const currentLevelXP = (player.level - 1) * 100;
    const nextLevelXP = player.level * 100;
    const progress = player.xp - currentLevelXP;
    const total = nextLevelXP - currentLevelXP;
    return Math.floor((progress / total) * 100);
  };

  const getJobTitle = () => {
    if (player.currentJob) {
      return player.currentJob.title;
    }
    return "Unemployed";
  };

  const getLevelTitle = () => {
    if (player.level <= 10) return "Beginner";
    if (player.level <= 25) return "Junior Developer";
    if (player.level <= 40) return "Mid-Level Developer";
    if (player.level <= 60) return "Senior Developer";
    return "Expert Developer";
  };

  return (
    <header className={styles.gameHeader}>
      <div className={styles.headerLeft}>
        <div className={styles.gameTitle}>
          <h1>🎮 SkillCrush</h1>
          <p className={styles.subtitle}>Web Developer Life Simulator</p>
        </div>
      </div>

      <div className={styles.headerCenter}>
        <div className={styles.playerInfo}>
          <div className={styles.playerName}>
            <span className={styles.level}>Level {player.level}</span>
            <span className={styles.title}>{getLevelTitle()}</span>
          </div>

          <div className={styles.xpBar}>
            <div className={styles.xpBarBackground}>
              <div
                className={styles.xpBarFill}
                style={{ width: `${getXPPercentage()}%` }}
              />
            </div>
            <span className={styles.xpText}>
              {player.xp} XP ({player.xpToNext} to next level)
            </span>
          </div>
        </div>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.gameStats}>
          <div className={styles.statItem}>
            <span className={styles.statEmoji}>📅</span>
            <span className={styles.statValue}>{formatDate(gameDate)}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statEmoji}>💰</span>
            <span className={styles.statValue}>
              {formatMoney(player.money)}
            </span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statEmoji}>⭐</span>
            <span className={styles.statValue}>{player.reputation}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statEmoji}>💼</span>
            <span className={styles.statValue}>{getJobTitle()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
