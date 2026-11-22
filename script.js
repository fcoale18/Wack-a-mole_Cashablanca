const slots = document.querySelectorAll(".slot");

const scoreDisplay = document.getElementById("score");

const timeLeftDisplay = document.getElementById("time-left");

const highScoreDisplay = document.getElementById("high-score");

const startBtn = document.getElementById("start-btn");

const statusMessage = document.getElementById("status-message");

const denominations = [
  "100 EUR",
  "50 USD",
  "1000 JPY",
  "200 DKK",
  "50 GBP",
  "100 CHF",
];

const SPAWN_SPEED = 850;
const VISIBLE_TIME = 800;

let score = 0;
let timeLeft = 30;
let lastSlotIndex = -1;
let gameTimerId = null;
let spawnTimerId = null;
let isPlaying = false;

let highScore = Number(localStorage.getItem("cashablanca_high_score")) || 0;
highScoreDisplay.textContent = highScore;

function getRandomSlot() {
  let index = Math.floor(Math.random() * slots.length);
  while (index === lastSlotIndex) {
    index = Math.floor(Math.random() * slots.length);
  }
  lastSlotIndex = index;
  return slots[index];
}

function spawnBanknote() {
  if (!isPlaying) {
    return;
  }

  const slot = getRandomSlot();
  const noteElement = slot.querySelector(".banknote");
  const isFake = Math.random() < 0.2;

  slot.classList.remove("hit");
  slot.classList.remove("fake");

  if (isFake) {
    slot.classList.add("fake");
    noteElement.textContent = "FAKE BILL";
  } else {
    const randomIndex = Math.floor(Math.random() * denominations.length);
    noteElement.textContent = denominations[randomIndex];
  }

  slot.classList.add("up");

  setTimeout(function () {
    slot.classList.remove("up");
    slot.classList.remove("fake");
    slot.classList.remove("hit");
  }, VISIBLE_TIME);
}

function handleSlotClick(event) {
  if (!isPlaying) {
    return;
  }

  const slot = event.currentTarget;

  if (!slot.classList.contains("up") || slot.classList.contains("hit")) {
    return;
  }

  slot.classList.add("hit");

  if (slot.classList.contains("fake")) {
    score = score - 2;
    if (score < 0) {
      score = 0;
    }
    statusMessage.textContent = "Counterfeit bill! -2 points";
  } else {
    score = score + 1;
    statusMessage.textContent = "Banknote cataloged! +1 point";
  }

  scoreDisplay.textContent = score;

  setTimeout(function () {
    slot.classList.remove("up");
    slot.classList.remove("fake");
    slot.classList.remove("hit");
  }, 120);
}

function endGame() {
  isPlaying = false;
  clearInterval(gameTimerId);
  clearInterval(spawnTimerId);
  startBtn.disabled = false;

  for (let i = 0; i < slots.length; i++) {
    slots[i].classList.remove("up");
    slots[i].classList.remove("fake");
    slots[i].classList.remove("hit");
  }

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("cashablanca_high_score", highScore);
    highScoreDisplay.textContent = highScore;
    statusMessage.textContent = "Vault closed! New high score: " + score;
  } else {
    statusMessage.textContent = "Vault closed! Final score: " + score;
  }
}

function startGame() {
  if (isPlaying) {
    return;
  }

  isPlaying = true;

  score = 0;
  timeLeft = 30;
  lastSlotIndex = -1;

  scoreDisplay.textContent = score;

  timeLeftDisplay.textContent = timeLeft;
  statusMessage.textContent = "Click the genuine banknotes!";

  startBtn.disabled = true;

  spawnBanknote();
  spawnTimerId = setInterval(spawnBanknote, SPAWN_SPEED);

  gameTimerId = setInterval(function () {
    timeLeft = timeLeft - 1;
    timeLeftDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

for (let i = 0; i < slots.length; i++) {
  slots[i].addEventListener("click", handleSlotClick);
}

startBtn.addEventListener("click", startGame);
