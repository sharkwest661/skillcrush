import React, { useEffect } from "react";
import { useGameStore } from "../../../stores/gameStore";
import styles from "./NotificationSystem.module.scss";

const NotificationSystem = ({ notifications }) => {
  const { removeNotification } = useGameStore();

  // Auto-remove notifications after their duration
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  if (!notifications || notifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      case "achievement":
        return "🏆";
      case "skill":
        return "🎓";
      case "money":
        return "💰";
      case "xp":
        return "⭐";
      default:
        return "📢";
    }
  };

  return (
    <div className={styles.notificationContainer}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.notification} ${
            styles[`notification--${notification.type}`]
          }`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className={styles.notificationIcon}>
            {getNotificationIcon(notification.type)}
          </div>

          <div className={styles.notificationContent}>
            {notification.title && (
              <div className={styles.notificationTitle}>
                {notification.title}
              </div>
            )}
            <div className={styles.notificationMessage}>
              {notification.message}
            </div>
          </div>

          <button
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
