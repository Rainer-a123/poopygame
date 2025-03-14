const player = document.getElementById("player");
const poopContainer = document.getElementById("poop-container");
const toiletPaperContainer = document.getElementById("toilet-paper-container");
const pointsDisplay = document.getElementById("points");
const healthDisplay = document.getElementById("health");
const waveDisplay = document.getElementById("wave");
let points = 0;
let health = 100;
let playerSpeed = 10; // Slightly slower player
let keys = { w: false, a: false, s: false, d: false }; // Track key states
let wave = 1;
let poopHealth = 1; // Poop health increases with waves
let shootCooldown = 0; // Cooldown for shooting
let damage = 1; // Base damage of toilet paper

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
function spawnPoop() {
  const poop = document.createElement("div");
  poop.classList.add("poop");
  poop.textContent = "💩";
  poop.style.left = `${Math.random() * window.innerWidth}px`;
  poop.style.top = `${Math.random() * window.innerHeight}px`;
  poop.dataset.health = poopHealth; // Set initial health

  // Add health bar
  const healthBar = document.createElement("div");
  healthBar.classList.add("poop-health-bar");
  const healthBarInner = document.createElement("div");
  healthBarInner.classList.add("poop-health-bar-inner");
  healthBar.appendChild(healthBarInner);
  poop.appendChild(healthBar);

  poopContainer.appendChild(poop);

  // Make poop chase the player
  const chasePlayer = setInterval(() => {
    const playerRect = player.getBoundingClientRect();
    const poopRect = poop.getBoundingClientRect();

    const angle = Math.atan2(
      playerRect.top - poopRect.top,
      playerRect.left - poopRect.left
    );
    const speed = 2 + wave * 0.2; // Speed increases with waves
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
      health -= 10; // Reduce health
      healthDisplay.textContent = health;
      poop.remove();
      clearInterval(chasePlayer);

      if (health <= 0) {
        alert("Game Over! You were overwhelmed by poop!");
        window.location.reload(); // Restart game
      }
    }
  }, 20);
}

// Shoot toilet paper
document.addEventListener("click", (e) => {
  if (shootCooldown > 0) return; // Cooldown check
  shootCooldown = 10; // Reset cooldown

  const toiletPaper = document.createElement("div");
  toiletPaper.classList.add("toilet-paper");
  toiletPaper.textContent = "🧻";
  toiletPaper.style.left = `${player.getBoundingClientRect().left + 20}px`; // Start from player
  toiletPaper.style.top = `${player.getBoundingClientRect().top + 20}px`;

  // Calculate direction
  const angle = Math.atan2(
    e.clientY - player.getBoundingClientRect().top,
    e.clientX - player.getBoundingClientRect().left
  );
  const speed = 5; // Speed of toilet paper
  const xSpeed = Math.cos(angle) * speed;
  const ySpeed = Math.sin(angle) * speed;

  toiletPaperContainer.appendChild(toiletPaper);

  // Move toilet paper
  const moveToiletPaper = setInterval(() => {
    const toiletPaperRect = toiletPaper.getBoundingClientRect();
    toiletPaper.style.left = `${toiletPaperRect.left + xSpeed}px`;
    toiletPaper.style.top = `${toiletPaperRect.top + ySpeed}px`;

    // Remove toilet paper if it goes off-screen
    if (
      toiletPaperRect.left < 0 ||
      toiletPaperRect.right > window.innerWidth ||
      toiletPaperRect.top < 0 ||
      toiletPaperRect.bottom > window.innerHeight
    ) {
      toiletPaper.remove();
      clearInterval(moveToiletPaper);
    }

    // Check collision with poop
    const poops = document.querySelectorAll(".poop");
    poops.forEach((poop) => {
      const poopRect = poop.getBoundingClientRect();
      if (
        toiletPaperRect.left < poopRect.right &&
        toiletPaperRect.right > poopRect.left &&
        toiletPaperRect.top < poopRect.bottom &&
        toiletPaperRect.bottom > poopRect.top
      ) {
        poop.dataset.health -= damage; // Reduce poop health by damage value
        const healthBarInner = poop.querySelector(".poop-health-bar-inner");
        healthBarInner.style.width = `${(poop.dataset.health / poopHealth) * 100}%`; // Update health bar

        if (poop.dataset.health <= 0) {
          poop.remove();
          points += 5; // 5 points per kill
          pointsDisplay.textContent = points;
        }
        toiletPaper.remove();
        clearInterval(moveToiletPaper);
      }
    });
  }, 20);
});

// Cooldown system for shooting
setInterval(() => {
  if (shootCooldown > 0) shootCooldown--;
}, 50);

// Wave system
function startWave() {
  waveDisplay.textContent = wave;
  for (let i = 0; i < wave * 2; i++) {
    spawnPoop();
  }
  wave++;
  poopHealth += 1; // Increase poop health each wave
  setTimeout(startWave, 10000); // Start next wave after 10 seconds
}

startWave(); // Start the first wave

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
        damage += 1; // Increase damage
        alert("Damage upgraded!");
      } else {
        alert("Not enough points!");
      }
      break;
    case "shootSpeed":
      if (points >= 15) {
        points -= 15;
        shootCooldown = Math.max(5, shootCooldown - 5); // Faster shooting
        alert("Shoot speed upgraded!");
      } else {
        alert("Not enough points!");
      }
      break;
  }
  pointsDisplay.textContent = points;
}