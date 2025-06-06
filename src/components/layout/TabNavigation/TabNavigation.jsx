import React from "react";
import { useGameStore } from "../../../stores/gameStore";
import styles from "./TabNavigation.module.scss";

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  const { notifications, player } = useGameStore();

  // Count notifications for each tab
  const getNotificationCount = (tabId) => {
    return notifications.filter((n) => n.tabId === tabId).length;
  };

  // Check if tab should show special indicator
  const getTabIndicator = (tab) => {
    switch (tab.id) {
      case "work":
        if (!player.currentJob) return null;
        return "💼";
      case "jobs":
        // Could show indicator for new job postings
        return null;
      case "life":
        // Could show indicator for affordable new items
        return null;
      default:
        return null;
    }
  };

  return (
    <nav className={styles.tabNavigation}>
      <div className={styles.tabContainer}>
        {tabs.map((tab) => {
          const notificationCount = getNotificationCount(tab.id);
          const isActive = activeTab === tab.id;
          const isAvailable = tab.available;
          const indicator = getTabIndicator(tab);

          return (
            <button
              key={tab.id}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""} ${
                !isAvailable ? styles.tabDisabled : ""
              }`}
              onClick={() => isAvailable && onTabChange(tab.id)}
              disabled={!isAvailable}
              title={tab.description}
            >
              <div className={styles.tabContent}>
                <span className={styles.tabEmoji}>{tab.emoji}</span>
                <span className={styles.tabLabel}>{tab.label}</span>

                {/* Notification badge */}
                {notificationCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}

                {/* Special indicator */}
                {indicator && (
                  <span className={styles.tabIndicator}>{indicator}</span>
                )}

                {/* Disabled overlay for unavailable tabs */}
                {!isAvailable && (
                  <div className={styles.disabledOverlay}>
                    <span className={styles.lockIcon}>🔒</span>
                  </div>
                )}
              </div>

              {/* Active tab underline */}
              {isActive && <div className={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>

      {/* Tab description for active tab */}
      <div className={styles.tabDescription}>
        {tabs.find((t) => t.id === activeTab)?.description}
      </div>
    </nav>
  );
};

export default TabNavigation;
