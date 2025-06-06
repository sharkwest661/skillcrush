import React, { useEffect } from "react";
import { useGameStore } from "../../../stores/gameStore";
import { useLearningStore } from "../../../stores/learningStore";
import SkillCrushBoard from "../../game/SkillCrushBoard/SkillCrushBoard";
import SkillTree from "../../game/SkillTree/SkillTree";
import SkillPointDisplay from "../../../ui/SkillPointDisplay/SkillPointDisplay";
import styles from "./LearningTab.module.scss";

const LearningTab = () => {
  const { player, addSkillPoints, addXP } = useGameStore();
  const {
    initializeBoard,
    endSession,
    session,
    score,
    combo,
    floatingTexts,
    cleanupFloatingTexts,
  } = useLearningStore();

  // Initialize board when component mounts
  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Clean up floating texts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupFloatingTexts();
    }, 500);

    return () => clearInterval(interval);
  }, [cleanupFloatingTexts]);

  // Award skill points when session ends or when leaving tab
  useEffect(() => {
    return () => {
      // Award skill points when leaving the learning tab
      Object.entries(session.skillPointsEarned).forEach(([colorId, points]) => {
        if (points > 0) {
          addSkillPoints(colorId, points);
        }
      });

      // Award XP based on performance
      const sessionXP = Math.floor(
        session.matchesFound * 2 + session.bestCombo
      );
      if (sessionXP > 0) {
        addXP(sessionXP);
      }
    };
  }, [session, addSkillPoints, addXP]);

  const handleEndSession = () => {
    // Award points before ending session
    Object.entries(session.skillPointsEarned).forEach(([colorId, points]) => {
      if (points > 0) {
        addSkillPoints(colorId, points);
      }
    });

    // Award XP
    const sessionXP = Math.floor(session.matchesFound * 2 + session.bestCombo);
    if (sessionXP > 0) {
      addXP(sessionXP);
    }

    endSession();
    initializeBoard(); // Start fresh
  };

  const getSessionSummary = () => {
    const totalPoints = Object.values(session.skillPointsEarned).reduce(
      (sum, points) => sum + points,
      0
    );
    return {
      matches: session.matchesFound,
      totalPoints,
      bestCombo: session.bestCombo,
      estimatedXP: Math.floor(session.matchesFound * 2 + session.bestCombo),
    };
  };

  const sessionSummary = getSessionSummary();

  return (
    <div className={styles.learningTab}>
      {/* Floating Texts */}
      {floatingTexts.map((text) => (
        <div
          key={text.id}
          className={`${styles.floatingText} ${
            styles[`floatingText--${text.type}`]
          }`}
          style={{
            left: text.x,
            top: text.y,
            animation: "floatUp 2s ease-out forwards",
          }}
        >
          {text.text}
        </div>
      ))}

      <div className={styles.learningLayout}>
        {/* LEFT SECTION - Game Board & Live Stats */}
        <div className={styles.gameSection}>
          <div className={styles.gameHeader}>
            <h2>🎮 SkillCrush</h2>
            <p>Match 3 or more skill gems to earn skill points!</p>
          </div>

          {/* Live Game Stats */}
          <div className={styles.liveStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Score</span>
              <span className={styles.statValue}>{score.toLocaleString()}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Combo</span>
              <span className={styles.statValue}>{combo}x</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Matches</span>
              <span className={styles.statValue}>{session.matchesFound}</span>
            </div>
          </div>

          {/* Game Board */}
          <SkillCrushBoard />

          {/* Session Summary & Claim Rewards */}
          <div className={styles.sessionCard}>
            <h3>📊 Current Session</h3>
            <div className={styles.sessionGrid}>
              <div className={styles.sessionStat}>
                <span>🎯 Matches</span>
                <span>{sessionSummary.matches}</span>
              </div>
              <div className={styles.sessionStat}>
                <span>⚡ Points</span>
                <span>{sessionSummary.totalPoints}</span>
              </div>
              <div className={styles.sessionStat}>
                <span>🔥 Best Combo</span>
                <span>{sessionSummary.bestCombo}x</span>
              </div>
              <div className={styles.sessionStat}>
                <span>🌟 XP</span>
                <span>{sessionSummary.estimatedXP}</span>
              </div>
            </div>

            {/* Session Points Preview */}
            {sessionSummary.totalPoints > 0 && (
              <div className={styles.sessionPreview}>
                <h4>💎 Points Earned This Session:</h4>
                <SkillPointDisplay
                  skillPoints={session.skillPointsEarned}
                  size="small"
                  showLabels={false}
                />
                <button
                  className={styles.claimButton}
                  onClick={handleEndSession}
                >
                  🎁 Claim Rewards & Start Fresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SECTION - Skill Management */}
        <div className={styles.skillSection}>
          {/* Available Skill Points */}
          <div className={styles.skillPointsCard}>
            <h3>⚡ Available Skill Points</h3>
            <p className={styles.cardSubtitle}>
              Spend these points to learn new skills
            </p>
            <SkillPointDisplay skillPoints={player.skillPoints} />

            {Object.values(player.skillPoints).every(
              (points) => points === 0
            ) && (
              <div className={styles.noPointsMessage}>
                <p>💡 Play SkillCrush to earn skill points!</p>
                <p>
                  Match skill gems to collect points you can spend on learning.
                </p>
              </div>
            )}
          </div>

          {/* Skill Tree - Completely Separate */}
          <div className={styles.skillTreeCard}>
            <h3>📚 Skill Tree</h3>
            <p className={styles.cardSubtitle}>
              Learn skills to unlock better job opportunities
            </p>
            <SkillTree />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningTab;
