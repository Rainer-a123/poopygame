const player = document.getElementById("player");
const poopContainer = document.getElementById("poop-container");
const toiletPaperContainer = document.getElementById("toilet-paper-container");
const pointsDisplay = document.getElementById("points");
const healthDisplay = document.getElementById("health");
const waveDisplay = document.getElementById("wave");
const currentGunDisplay = document.getElementById("current-gun");
let points = 0;
let health = 100;
let playerSpeed = 10; // Slightly slower player
let keys = { w: false, a: false, s: false, d: false }; // Track key states
let wave = 1;
let poopHealth = 1; // Poop health increases with waves
let shootCooldown = 0; // Cooldown for shooting
let currentGun = "toiletPaper"; // Default gun
let poopsAlive = 0; // Track number of poops alive

// Gun stats
const guns = {
  toiletPaper: {
    name: "Toilet Paper",
    damage: 1,
    fireRate: 10, // Cooldown between shots
    projectile: "🧻", // Emoji for projectile
    cost: 0,
  },
  rpg: {
    name: "RPG",
    damage: 5, // High damage
    fireRate: 50, // Slow fire rate
    projectile: "💥", // Emoji for projectile
    cost: 50,
    splashDamage: true, // Explosion damage
  },
  machineGun: {
    name: "Machine Gun",
    damage: 1,
    fireRate: 2, // Very fast fire rate
    projectile: "🔫", // Emoji for projectile
    cost: 30,
  },
  laserGun: {
    name: "Laser Gun",
    damage: 2, // Moderate damage
    fireRate: 20, // Moderate fire rate
    projectile: "🔺", // Emoji for projectile
    cost: 40,
    piercing: true, // Pierces through multiple poops
  },
  freezeGun: {
    name: "Freeze Gun",
    damage: 0, // No damage
    fireRate: 30, // Slow fire rate
    projectile: "❄️", // Emoji for projectile
    cost: 60,
    freezeDuration: 3000, // Freeze poops for 3 seconds
  },
};

// Enemy types
const enemyTypes = {
  normal: {
    health: 1,
    speed: 2,
    emoji: "💩",
  },
  exploding: {
    health: 2,
    speed: 2,
    emoji: "💩💣",
    explodeDamage: 3, // Damage dealt on explosion
  },
  fast: {
    health: 1,
    speed: 4,
    emoji: "💩💨",
  },
  tank: {
    health: 10,
    speed: 1,
    emoji: "💩🛡️",
  },
  split: {
    health: 3,
    speed: 2,
    emoji: "💩💩",
    splitInto: 2, // Splits into 2 smaller poops
  },
};

// Player movement
document.addEventListener("keydown", (e) => {
  if (e.key === "w") keys.w = true;
  if (e.key === "a") keys.a = true;
  if (e.key === "s") keys.s = true;
  if (e.key === "d") keys.d = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w") keys.w = false;
  if (e.key === "a") keys.a = false;
  if (e.key === "s") keys.s = false;
  if (e.key === "d") keys.d = false;
});

// Smooth movement using requestAnimationFrame
function updatePlayerPosition() {
  const playerRect = player.getBoundingClientRect();
  if (keys.w && playerRect.top > 0) {
    player.style.top = `${playerRect.top - playerSpeed}px`;
  }
  if (keys.a && playerRect.left > 0) {
    player.style.left = `${playerRect.left - playerSpeed}px`;
  }
  if (keys.s && playerRect.bottom < window.innerHeight) {
    player.style.top = `${playerRect.top + playerSpeed}px`;
  }
  if (keys.d && playerRect.right < window.innerWidth) {
    player.style.left = `${playerRect.left + playerSpeed}px`;
  }
  requestAnimationFrame(updatePlayerPosition);
}

updatePlayerPosition(); // Start the movement loop

// Spawn poop
function spawnPoop(type = "normal", isBoss = false) {
  const poop = document.createElement("div");
  poop.classList.add("poop");
  if (isBoss) poop.classList.add("boss"); // Add boss class
  poop.textContent = enemyTypes[type].emoji;
  poop.style.left = `${Math.random() * window.innerWidth}px`;
  poop.style.top = `${Math.random() * window.innerHeight}px`;
  poop.dataset.health = isBoss ? poopHealth * 5 : enemyTypes[type].health * poopHealth; // Boss has 5x health
  poop.dataset.type = type; // Store enemy type
  poop.dataset.isBoss = isBoss; // Mark as boss poop

  // Add health bar
  const healthBar = document.createElement("div");
  healthBar.classList.add("poop-health-bar");
  const healthBarInner = document.createElement("div");
  healthBarInner.classList.add("poop-health-bar-inner");
  healthBar.appendChild(healthBarInner);
  poop.appendChild(healthBar);

  poopContainer.appendChild(poop);
  poopsAlive++;

  // Make poop chase the player
  const chasePlayer = setInterval(() => {
    const playerRect = player.getBoundingClientRect();
    const poopRect = poop.getBoundingClientRect();

    const angle = Math.atan2(
      playerRect.top - poopRect.top,
      playerRect.left - poopRect.left
    );
    const speed = isBoss ? 4 + wave * 0.2 : enemyTypes[type].speed + wave * 0.2; // Boss moves faster
    const xSpeed = Math.cos(angle) * speed;
    const ySpeed = Math.sin(angle) * speed;

    poop.style.left = `${poopRect.left + xSpeed}px`;
    poop.style.top = `${poopRect.top + ySpeed}px`;

    // Check collision with player
    if (
      playerRect.left < poopRect.right &&
      playerRect.right > poopRect.left &&
      playerRect.top < poopRect.bottom &&
      playerRect.bottom > poopRect.top
    ) {
      health -= isBoss ? 20 : 10; // Boss deals more damage
      healthDisplay.textContent = health;
      poop.remove();
      poopsAlive--;
      clearInterval(chasePlayer);

      if (health <= 0) {
        alert("Game Over! You were overwhelmed by poop!");
        window.location.reload(); // Restart game
      }
    }
  }, 20);
}

// Shoot projectiles
document.addEventListener("click", (e) => {
  if (shootCooldown > 0) return; // Cooldown check
  shootCooldown = guns[currentGun].fireRate; // Set cooldown based on gun

  const projectile = document.createElement("div");
  projectile.classList.add("toilet-paper");
  projectile.textContent = guns[currentGun].projectile;
  projectile.style.left = `${player.getBoundingClientRect().left + 20}px`; // Start from player
  projectile.style.top = `${player.getBoundingClientRect().top + 20}px`;

  // Calculate direction
  const angle = Math.atan2(
    e.clientY - player.getBoundingClientRect().top,
    e.clientX - player.getBoundingClientRect().left
  );
  const speed = 5; // Speed of projectile
  const xSpeed = Math.cos(angle) * speed;
  const ySpeed = Math.sin(angle) * speed;

  toiletPaperContainer.appendChild(projectile);

  // Move projectile
  const moveProjectile = setInterval(() => {
    const projectileRect = projectile.getBoundingClientRect();
    projectile.style.left = `${projectileRect.left + xSpeed}px`;
    projectile.style.top = `${projectileRect.top + ySpeed}px`;

    // Remove projectile if it goes off-screen
    if (
      projectileRect.left < 0 ||
      projectileRect.right > window.innerWidth ||
      projectileRect.top < 0 ||
      projectileRect.bottom > window.innerHeight
    ) {
      projectile.remove();
      clearInterval(moveProjectile);
    }

    // Check collision with poop
    const poops = document.querySelectorAll(".poop");
    poops.forEach((poop) => {
      const poopRect = poop.getBoundingClientRect();
      if (
        projectileRect.left < poopRect.right &&
        projectileRect.right > poopRect.left &&
        projectileRect.top < poopRect.bottom &&
        projectileRect.bottom > poopRect.top
      ) {
        // Apply damage
        poop.dataset.health -= guns[currentGun].damage;
        const healthBarInner = poop.querySelector(".poop-health-bar-inner");
        healthBarInner.style.width = `${(poop.dataset.health / (poop.dataset.isBoss ? poopHealth * 5 : enemyTypes[poop.dataset.type].health * poopHealth)) * 100}%`; // Update health bar

        // Check for splash damage (RPG)
        if (guns[currentGun].splashDamage) {
          poops.forEach((otherPoop) => {
            if (otherPoop !== poop) { // Don't damage the same poop twice
              const otherPoopRect = otherPoop.getBoundingClientRect();
              const distance = Math.sqrt(
                Math.pow(poopRect.left - otherPoopRect.left, 2) +
                Math.pow(poopRect.top - otherPoopRect.top, 2)
              );
              if (distance < 50) { // Splash radius
                otherPoop.dataset.health -= guns[currentGun].damage;
                const otherHealthBarInner = otherPoop.querySelector(".poop-health-bar-inner");
                otherHealthBarInner.style.width = `${(otherPoop.dataset.health / (otherPoop.dataset.isBoss ? poopHealth * 5 : enemyTypes[otherPoop.dataset.type].health * poopHealth)) * 100}%`;
                if (otherPoop.dataset.health <= 0) {
                  handlePoopDeath(otherPoop);
                }
              }
            }
          });
        }

        // Check for freeze effect (Freeze Gun)
        if (guns[currentGun].freezeDuration) {
          poop.style.opacity = "0.5"; // Visual effect for freezing
          poop.style.pointerEvents = "none"; // Prevent further interactions
          setTimeout(() => {
            poop.style.opacity = "1";
            poop.style.pointerEvents = "auto";
          }, guns[currentGun].freezeDuration);
        }

        if (poop.dataset.health <= 0) {
          handlePoopDeath(poop);
        }
        projectile.remove();
        clearInterval(moveProjectile);
      }
    });
  }, 20);
});

// Handle poop death
function handlePoopDeath(poop) {
  const type = poop.dataset.type;
  poop.remove();
  points += 5; // 5 points per kill
  pointsDisplay.textContent = points;
  poopsAlive--;

  // Handle special enemy effects
  switch (type) {
    case "exploding":
      // Damage nearby poops and player
      const poops = document.querySelectorAll(".poop");
      poops.forEach((otherPoop) => {
        const otherPoopRect = otherPoop.getBoundingClientRect();
        const distance = Math.sqrt(
          Math.pow(poop.offsetLeft - otherPoopRect.left, 2) +
          Math.pow(poop.offsetTop - otherPoopRect.top, 2)
        );
        if (distance < 50) { // Explosion radius
          otherPoop.dataset.health -= enemyTypes.exploding.explodeDamage;
          const healthBarInner = otherPoop.querySelector(".poop-health-bar-inner");
          healthBarInner.style.width = `${(otherPoop.dataset.health / (otherPoop.dataset.isBoss ? poopHealth * 5 : enemyTypes[otherPoop.dataset.type].health * poopHealth)) * 100}%`;
          if (otherPoop.dataset.health <= 0) {
            handlePoopDeath(otherPoop);
          }
        }
      });
      break;
    case "split":
      // Split into smaller poops
      for (let i = 0; i < enemyTypes.split.splitInto; i++) {
        spawnPoop("normal");
      }
      break;
  }

  // Check if wave is cleared
  if (poopsAlive === 0) {
    startWave();
  }
}

// Cooldown system for shooting
setInterval(() => {
  if (shootCooldown > 0) shootCooldown--;
}, 50);

// Start a new wave
function startWave() {
  waveDisplay.textContent = wave;
  const numPoops = wave * 2; // Number of poops increases with wave
  for (let i = 0; i < numPoops; i++) {
    const type = getRandomEnemyType(); // Randomly choose enemy type
    spawnPoop(type);
  }
  // Spawn boss poop every 3 waves
  if (wave % 3 === 0) {
    spawnPoop("normal", true); // Spawn boss poop
  }
  wave++;
  poopHealth += 1; // Increase poop health each wave
}

// Get random enemy type
function getRandomEnemyType() {
  const types = Object.keys(enemyTypes);
  return types[Math.floor(Math.random() * types.length)];
}

startWave(); // Start the first wave

// Buy guns
function buyGun(gunType) {
  if (points >= guns[gunType].cost || gunType === "toiletPaper") {
    points -= guns[gunType].cost;
    currentGun = gunType;
    currentGunDisplay.textContent = guns[gunType].name;
    pointsDisplay.textContent = points;
    alert(`Equipped ${guns[gunType].name}!`);
  } else {
    alert("Not enough points!");
  }
}

// Buy upgrades
function buyUpgrade(type) {
  switch (type) {
    case "speed":
      if (points >= 10) {
        points -= 10;
        playerSpeed += 5;
        alert("Speed upgraded!");
      } else {
        alert("Not enough points!");
      }
      break;
    case "damage":
      if (points >= 20) {
        points -= 20;
        guns[currentGun].damage += 1; // Increase damage for current gun
        alert("Damage upgraded!");
      } else {
        alert("Not enough points!");
      }
      break;
    case "shootSpeed":
      if (points >= 15) {
        points -= 15;
        guns[currentGun].fireRate = Math.max(2, guns[currentGun].fireRate - 3); // Faster shooting
        alert("Shoot speed upgraded!");
      } else {
        alert("Not enough points!");
      }
      break;
  }
  pointsDisplay.textContent = points;
}
