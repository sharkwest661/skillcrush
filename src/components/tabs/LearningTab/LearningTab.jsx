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

      <div className={styles.learningContent}>
        {/* Left Column - Game Board */}
        <div className={styles.gameColumn}>
          <div className={styles.gameHeader}>
            <h2>🎮 SkillCrush</h2>
            <p>Match 3 or more skill gems to earn skill points!</p>
          </div>

          <div className={styles.gameStats}>
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

          <SkillCrushBoard />

          {/* Session Summary */}
          <div className={styles.sessionSummary}>
            <h3>📊 Current Session</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span>🎯 Matches Found</span>
                <span>{sessionSummary.matches}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>⚡ Points Earned</span>
                <span>{sessionSummary.totalPoints}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>🔥 Best Combo</span>
                <span>{sessionSummary.bestCombo}x</span>
              </div>
              <div className={styles.summaryItem}>
                <span>🌟 Estimated XP</span>
                <span>{sessionSummary.estimatedXP}</span>
              </div>
            </div>

            {sessionSummary.totalPoints > 0 && (
              <button
                className={styles.endSessionButton}
                onClick={handleEndSession}
              >
                🎁 Claim Rewards & Start Fresh
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Skills */}
        <div className={styles.skillsColumn}>
          {/* Current Skill Points */}
          <div className={styles.skillPointsSection}>
            <h3>⚡ Available Skill Points</h3>
            <SkillPointDisplay skillPoints={player.skillPoints} />
          </div>

          {/* Session Skill Points (if any earned) */}
          {Object.keys(session.skillPointsEarned).length > 0 && (
            <div className={styles.sessionPointsSection}>
              <h3>🎯 Points Earned This Session</h3>
              <SkillPointDisplay skillPoints={session.skillPointsEarned} />
              <p className={styles.sessionNote}>
                💡 These points will be added to your total when you claim
                rewards!
              </p>
            </div>
          )}

          {/* Skill Tree */}
          <div className={styles.skillTreeSection}>
            <h3>📚 Skill Tree</h3>
            <p>Learn new skills to unlock better job opportunities!</p>
            <SkillTree />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningTab;
