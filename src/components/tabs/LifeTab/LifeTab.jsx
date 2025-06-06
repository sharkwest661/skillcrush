import React, { useState } from "react";
import { useGameStore } from "../../../stores/gameStore";
import styles from "./LifeTab.module.scss";

const LifeTab = () => {
  const { player, canAfford, spendMoney, addToInventory } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState("housing");

  // Sample items for demonstration
  const storeItems = {
    housing: [
      {
        id: "studio",
        name: "Studio Apartment",
        price: 0,
        description: "Basic starting accommodation",
        emoji: "🏠",
        owned: player.inventory.housing === "studio",
      },
      {
        id: "apartment-1br",
        name: "1BR Apartment",
        price: 5000,
        description: "+5% learning speed - Comfortable study space",
        emoji: "🏠",
        owned: player.inventory.housing === "apartment-1br",
      },
      {
        id: "apartment-2br",
        name: "2BR Apartment",
        price: 15000,
        description: "+10% learning speed - Dedicated office space",
        emoji: "🏡",
        owned: player.inventory.housing === "apartment-2br",
      },
      {
        id: "house",
        name: "Suburban House",
        price: 50000,
        description: "+15% learning speed, +5% work performance",
        emoji: "🏘️",
        owned: player.inventory.housing === "house",
      },
    ],
    transport: [
      {
        id: "walking",
        name: "Walking",
        price: 0,
        description: "Free transportation",
        emoji: "🚶",
        owned: player.inventory.transport === "walking",
      },
      {
        id: "bicycle",
        name: "Bicycle",
        price: 500,
        description: "+1% interview success - Eco-friendly image",
        emoji: "🚲",
        owned: player.inventory.transport === "bicycle",
      },
      {
        id: "used-car",
        name: "Used Car",
        price: 8000,
        description: "Reliable transportation",
        emoji: "🚗",
        owned: player.inventory.transport === "used-car",
      },
      {
        id: "new-car",
        name: "New Car",
        price: 25000,
        description: "+2% interview success - Professional appearance",
        emoji: "🚙",
        owned: player.inventory.transport === "new-car",
      },
    ],
    tech: [
      {
        id: "gaming-laptop",
        name: "Gaming Laptop",
        price: 3000,
        description: "+5% work performance - Better multitasking",
        emoji: "💻",
        owned: player.inventory.tech.includes("gaming-laptop"),
      },
      {
        id: "macbook-pro",
        name: "MacBook Pro",
        price: 4000,
        description: "+7% work performance - Industry standard",
        emoji: "💻",
        owned: player.inventory.tech.includes("macbook-pro"),
      },
      {
        id: "dual-monitors",
        name: "Dual Monitor Setup",
        price: 2000,
        description: "+5% productivity bonus",
        emoji: "🖥️",
        owned: player.inventory.tech.includes("dual-monitors"),
      },
      {
        id: "mechanical-keyboard",
        name: "Mechanical Keyboard",
        price: 200,
        description: "+1% work speed bonus",
        emoji: "⌨️",
        owned: player.inventory.tech.includes("mechanical-keyboard"),
      },
    ],
  };

  const categories = [
    { id: "housing", name: "Housing", emoji: "🏠" },
    { id: "transport", name: "Transport", emoji: "🚗" },
    { id: "tech", name: "Tech Setup", emoji: "💻" },
  ];

  const handlePurchase = (item, category) => {
    if (canAfford(item.price) && !item.owned) {
      spendMoney(item.price);
      addToInventory(category, item.id);

      useGameStore.getState().addNotification({
        type: "success",
        title: "Purchase Complete!",
        message: `You bought ${item.name}!`,
        duration: 2000,
      });
    }
  };

  return (
    <div className={styles.lifeTab}>
      <div className={styles.lifeHeader}>
        <h2>🏠 Lifestyle Store</h2>
        <p>
          Improve your living situation to boost your productivity and career
          prospects!
        </p>
        <div className={styles.moneyDisplay}>
          💰 Available: ${player.money.toLocaleString()}
        </div>
      </div>

      <div className={styles.categoryTabs}>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryTab} ${
              selectedCategory === category.id ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.emoji} {category.name}
          </button>
        ))}
      </div>

      <div className={styles.itemsGrid}>
        {storeItems[selectedCategory]?.map((item) => (
          <div
            key={item.id}
            className={`${styles.itemCard} ${item.owned ? styles.owned : ""} ${
              canAfford(item.price) ? styles.affordable : styles.expensive
            }`}
          >
            <div className={styles.itemEmoji}>{item.emoji}</div>
            <h3 className={styles.itemName}>{item.name}</h3>
            <p className={styles.itemDescription}>{item.description}</p>

            <div className={styles.itemPrice}>
              {item.price === 0 ? "Free" : `$${item.price.toLocaleString()}`}
            </div>

            <button
              className={`${styles.purchaseButton} ${
                item.owned
                  ? styles.owned
                  : canAfford(item.price)
                  ? styles.canBuy
                  : styles.cantBuy
              }`}
              onClick={() => handlePurchase(item, selectedCategory)}
              disabled={item.owned || !canAfford(item.price)}
            >
              {item.owned
                ? "✅ Owned"
                : canAfford(item.price)
                ? "💳 Purchase"
                : "🔒 Can't Afford"}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.currentInventory}>
        <h3>📦 Current Inventory</h3>
        <div className={styles.inventoryGrid}>
          <div className={styles.inventoryItem}>
            <strong>🏠 Housing:</strong> {player.inventory.housing || "None"}
          </div>
          <div className={styles.inventoryItem}>
            <strong>🚗 Transport:</strong>{" "}
            {player.inventory.transport || "None"}
          </div>
          <div className={styles.inventoryItem}>
            <strong>💻 Tech:</strong>{" "}
            {player.inventory.tech.length > 0
              ? player.inventory.tech.join(", ")
              : "Basic laptop only"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeTab;
