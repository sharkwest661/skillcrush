import React, { useState } from "react";
import { useGameStore } from "../../../stores/gameStore";
import {
  SKILL_TREE,
  SKILL_CATEGORIES,
  SKILL_COLORS,
} from "../../../data/skills";
import styles from "./SkillTree.module.scss";

const SkillTree = () => {
  const { player, learnSkill } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Group skills by category
  const getSkillsByCategory = () => {
    const categories = {};
    Object.entries(SKILL_TREE).forEach(([skillName, skillData]) => {
      const category = skillData.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ name: skillName, ...skillData });
    });
    return categories;
  };

  // Check if skill can be learned
  const canLearnSkill = (skillName, skillData) => {
    if (player.skills[skillName]) return false; // Already learned

    // Check prerequisites
    const prereqsMet = skillData.prereqs.every(
      (prereq) => player.skills[prereq]
    );
    if (!prereqsMet) return false;

    // Check skill points - FIXED LOGIC
    const skillPointCosts = getSkillCost(skillData);
    return Object.entries(skillPointCosts).every(([colorId, cost]) => {
      return player.skillPoints[colorId] >= cost;
    });
  };

  // Get skill cost display - FIXED TO EXCLUDE NON-COST PROPERTIES
  const getSkillCost = (skillData) => {
    const costs = {};
    Object.keys(skillData).forEach((key) => {
      // Only include color-based skill point costs
      if (SKILL_COLORS.some((color) => color.id === key)) {
        costs[key] = skillData[key];
      }
    });
    return costs;
  };

  // Filter skills based on search and category
  const getFilteredSkills = () => {
    const skillsByCategory = getSkillsByCategory();
    let filtered = {};

    if (selectedCategory === "all") {
      filtered = skillsByCategory;
    } else {
      filtered = {
        [selectedCategory]: skillsByCategory[selectedCategory] || [],
      };
    }

    if (searchTerm) {
      Object.keys(filtered).forEach((category) => {
        filtered[category] = filtered[category].filter(
          (skill) =>
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  };

  const handleLearnSkill = (skillName, skillData) => {
    if (canLearnSkill(skillName, skillData)) {
      learnSkill(skillName, skillData);
    }
  };

  const getDifficultyStars = (difficulty) => {
    return "⭐".repeat(difficulty) + "☆".repeat(6 - difficulty);
  };

  const filteredSkills = getFilteredSkills();

  return (
    <div className={styles.skillTree}>
      {/* Controls */}
      <div className={styles.skillTreeControls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.categoryFilter}>
          <button
            className={`${styles.categoryButton} ${
              selectedCategory === "all" ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            All Skills
          </button>
          {Object.entries(SKILL_CATEGORIES).map(([category, categoryData]) => (
            <button
              key={category}
              className={`${styles.categoryButton} ${
                selectedCategory === category ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory(category)}
              style={{ "--category-color": categoryData.color }}
            >
              {categoryData.emoji} {category}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Display */}
      <div className={styles.skillCategories}>
        {Object.entries(filteredSkills).map(([category, skills]) => (
          <div key={category} className={styles.skillCategory}>
            <h3 className={styles.categoryHeader}>
              {SKILL_CATEGORIES[category]?.emoji} {category}
              <span className={styles.skillCount}>
                ({skills.length} skills)
              </span>
            </h3>

            <div className={styles.skillGrid}>
              {skills.map((skill) => {
                const isLearned = player.skills[skill.name];
                const canLearn = canLearnSkill(skill.name, skill);
                const prereqsMet = skill.prereqs.every(
                  (prereq) => player.skills[prereq]
                );
                const costs = getSkillCost(skill);

                return (
                  <div
                    key={skill.name}
                    className={`${styles.skillCard} ${
                      isLearned
                        ? styles.skillLearned
                        : canLearn
                        ? styles.skillAvailable
                        : prereqsMet
                        ? styles.skillLocked
                        : styles.skillUnavailable
                    }`}
                  >
                    <div className={styles.skillHeader}>
                      <h4 className={styles.skillName}>
                        {skill.name}
                        {isLearned && (
                          <span className={styles.learnedBadge}>✅</span>
                        )}
                      </h4>

                      <div className={styles.skillMeta}>
                        <span className={styles.skillDifficulty}>
                          {getDifficultyStars(skill.difficulty)}
                        </span>
                        {/* REMOVED EARNINGS DISPLAY */}
                      </div>
                    </div>

                    <p className={styles.skillDescription}>
                      {skill.description}
                    </p>

                    {/* Prerequisites */}
                    {skill.prereqs.length > 0 && (
                      <div className={styles.skillPrereqs}>
                        <span className={styles.prereqLabel}>Requires:</span>
                        {skill.prereqs.map((prereq) => (
                          <span
                            key={prereq}
                            className={`${styles.prereqItem} ${
                              player.skills[prereq]
                                ? styles.prereqMet
                                : styles.prereqUnmet
                            }`}
                          >
                            {prereq}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Cost */}
                    {!isLearned && prereqsMet && (
                      <div className={styles.skillCost}>
                        <span className={styles.costLabel}>Cost:</span>
                        <div className={styles.costItems}>
                          {Object.entries(costs).map(([colorId, amount]) => {
                            const color = SKILL_COLORS.find(
                              (c) => c.id === colorId
                            );
                            const hasEnough =
                              player.skillPoints[colorId] >= amount;

                            return (
                              <span
                                key={colorId}
                                className={`${styles.costItem} ${
                                  hasEnough
                                    ? styles.costAffordable
                                    : styles.costUnaffordable
                                }`}
                                style={{ "--cost-color": color?.color }}
                              >
                                {amount} {color?.emoji}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Learn Button */}
                    {!isLearned && prereqsMet && (
                      <button
                        className={`${styles.learnButton} ${
                          canLearn ? styles.canLearn : styles.cantLearn
                        }`}
                        onClick={() => handleLearnSkill(skill.name, skill)}
                        disabled={!canLearn}
                      >
                        {canLearn ? "🎓 Learn Skill" : "🔒 Insufficient Points"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary - REMOVED EARNINGS */}
      <div className={styles.skillSummary}>
        <div className={styles.summaryItem}>
          <span>📚 Skills Learned</span>
          <span>{Object.keys(player.skills).length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span>⚡ Total Points Available</span>
          <span>
            {Object.values(player.skillPoints).reduce(
              (sum, points) => sum + points,
              0
            )}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span>🎯 Categories Mastered</span>
          <span>
            {
              Object.keys(SKILL_CATEGORIES).filter((category) => {
                const categorySkills = Object.keys(SKILL_TREE).filter(
                  (skillName) => SKILL_TREE[skillName].category === category
                );
                return categorySkills.some(
                  (skillName) => player.skills[skillName]
                );
              }).length
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
