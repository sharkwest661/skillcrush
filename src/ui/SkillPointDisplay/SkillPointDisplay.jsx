import React from "react";
import { SKILL_COLORS } from "../../data/skills";
import styles from "./SkillPointDisplay.module.scss";

const SkillPointDisplay = ({
  skillPoints,
  showLabels = true,
  size = "normal",
}) => {
  return (
    <div
      className={`${styles.skillPointGrid} ${
        styles[`skillPointGrid--${size}`]
      }`}
    >
      {SKILL_COLORS.map((skill) => {
        const points = skillPoints[skill.id] || 0;

        return (
          <div
            key={skill.id}
            className={styles.skillPointItem}
            style={{
              "--skill-color": skill.color,
              "--skill-opacity": points > 0 ? 1 : 0.3,
            }}
          >
            <div className={styles.skillIcon}>
              <span className={styles.skillEmoji}>{skill.emoji}</span>
              <div
                className={styles.skillGlow}
                style={{ backgroundColor: skill.color }}
              />
            </div>

            <div className={styles.skillInfo}>
              {showLabels && (
                <span className={styles.skillLabel}>{skill.skill}</span>
              )}
              <span className={styles.skillPoints}>
                {points}
                {points === 1 ? " point" : " points"}
              </span>
            </div>

            {/* Progress bar for visual appeal */}
            <div className={styles.skillProgress}>
              <div
                className={styles.skillProgressFill}
                style={{
                  width: `${Math.min(points * 2, 100)}%`,
                  backgroundColor: skill.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SkillPointDisplay;
