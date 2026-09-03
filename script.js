// ==========================================
// EYE ROULETTE 👀
// MILESTONE 9 — PERSONALITY & HUMOR
// ==========================================

// ==========================================
// GAME STATE
// ==========================================

let playerChoice = null;
let systemChoice = null;

let score = 0;
let roundNumber = 1;
let roundsSurvived = 0;

let countdownInterval = null;
let isCountdownActive = false;
let resultProcessed = false;
let gameOver = false;

let continueKey = null;


// ==========================================
// PERSONALITY MESSAGE POOLS
// ==========================================

const messages = {

  // OPEN + CLOSED
  // Player gets +1 point
  riskySafe: [
    "+1. Bold move.",
    "Risky. Respect.",
    "YOU LOOKED. THEY DIDN'T.",
    "Eye contact successfully avoided.",
    "That was unnecessarily brave.",
    "One point for confidence.",
    "Calculated? Probably.",
    "Bold enough to look. Lucky enough to survive.",
    "THE EYES BLINKED FIRST.",
    "Okay, that actually worked."
  ],

  // CLOSED + OPEN
  // Player survives with 0 points
  closedOpen: [
    "Cowardice detected. 0 points.",
    "You didn't look. Smart.",
    "Technically, that's surviving.",
    "Eyes closed. Problem solved.",
    "Bravery was not required.",
    "Strategic blindness.",
    "You saw absolutely nothing. Perfect.",
    "Zero points. Zero eye contact.",
    "Can't make eye contact if you don't look.",
    "That counts. We think."
  ],

  // CLOSED + CLOSED
  // Player survives with 0 points
  bothClosed: [
    "Nobody looked. Beautiful.",
    "Two cowards. Zero points.",
    "An incredible display of avoiding responsibility.",
    "Nothing happened. Perfect.",
    "Everyone blinked. Nobody knows why.",
    "Mutual avoidance achieved.",
    "Peak social interaction.",
    "Eye contact: successfully cancelled.",
    "Congratulations on doing absolutely nothing.",
    "Both chose peace."
  ],

  // OPEN + OPEN
  // Game Over
  gameOver: [
    "EYE CONTACT DETECTED.",
    "THE EYES HAVE WON.",
    "You looked. They looked. It was over.",
    "Congratulations. You made eye contact.",
    "Social interaction: FAILED.",
    "That was awkward.",
    "You had ONE job.",
    "Eye contact was your downfall.",
    "The system saw everything.",
    "Should've closed your eyes.",
    "Your honesty has consequences."
  ]
};


// ==========================================
// RANDOM MESSAGE HELPER
// ==========================================

function getRandomMessage(messageList) {
  const randomIndex = Math.floor(Math.random() * messageList.length);
  return messageList[randomIndex];
}


// ==========================================
// DOM ELEMENTS
// ==========================================

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

const roundNumberDisplay = document.getElementById("round-number");
const currentScoreDisplay = document.getElementById("current-score");
const highScoreDisplay = document.getElementById("high-score");

const systemEyeVisual = document.getElementById("system-eye-visual");
const systemEyeState = document.getElementById("system-eye-state");

const choiceOpenButton = document.getElementById("choice-open");
const choiceClosedButton = document.getElementById("choice-closed");

const countdownArea = document.getElementById("countdown-area");
const countdownNumber = document.getElementById("countdown-number");

const revealArea = document.getElementById("reveal-area");
const revealSystemState = document.getElementById("reveal-system-state");

const resultSafe = document.getElementById("result-safe");
const resultPoint = document.getElementById("result-point");
const resultClosedSafe = document.getElementById("result-closed-safe");
const resultGameOver = document.getElementById("result-game-over");

const statusMessage = document.getElementById("status-message");

const gameOverHeading = document.getElementById("game-over-heading");
const gameOverMessage = document.getElementById("game-over-message");
const gameOverSubmessage = document.getElementById("game-over-submessage");

const finalScoreValue = document.getElementById("final-score-value");
const roundsSurvivedValue = document.getElementById("rounds-survived-value");
const finalHighScoreValue = document.getElementById("final-high-score-value");


// ==========================================
// START GAME
// ==========================================

function startGame() {
  playerChoice = null;
  systemChoice = null;

  score = 0;
  roundNumber = 1;
  roundsSurvived = 0;

  countdownInterval = null;
  isCountdownActive = false;
  resultProcessed = false;
  gameOver = false;

  continueKey = null;

  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  gameScreen.style.display = "block";

  currentScoreDisplay.textContent = score;
  roundNumberDisplay.textContent = roundNumber;

  startRound();
}


// ==========================================
// START ROUND
// ==========================================

function startRound() {
  playerChoice = null;
  systemChoice = null;

  isCountdownActive = false;
  resultProcessed = false;
  continueKey = null;

  choiceOpenButton.disabled = false;
  choiceClosedButton.disabled = false;

  choiceOpenButton.classList.remove("selected");
  choiceClosedButton.classList.remove("selected");

  countdownArea.style.display = "none";
  revealArea.style.display = "none";

  resultSafe.style.display = "none";
  resultPoint.style.display = "none";
  resultClosedSafe.style.display = "none";
  resultGameOver.style.display = "none";

  systemEyeVisual.textContent = "👁️";
  systemEyeState.textContent = "???";

  statusMessage.textContent = "Choose your eyes.";

  roundNumberDisplay.textContent = roundNumber;
  currentScoreDisplay.textContent = score;
}


// ==========================================
// START NEXT ROUND
// ==========================================

function startNextRound() {
  if (resultProcessed === false) {
    return;
  }

  if (gameOver === true) {
    return;
  }

  roundNumber++;

  startRound();
}


// ==========================================
// PLAYER CHOICE
// ==========================================

function selectPlayerChoice(choice) {
  if (gameOver === true) {
    return;
  }

  if (isCountdownActive === true) {
    return;
  }

  if (playerChoice !== null) {
    return;
  }

  playerChoice = choice;

  choiceOpenButton.disabled = true;
  choiceClosedButton.disabled = true;

  if (choice === "OPEN") {
    choiceOpenButton.classList.add("selected");
  }

  if (choice === "CLOSED") {
    choiceClosedButton.classList.add("selected");
  }

  // System chooses exactly once.
  systemChoice = Math.random() < 0.5 ? "OPEN" : "CLOSED";

  systemEyeState.textContent = "???";

  statusMessage.textContent = "Choice locked. Get ready...";

  startCountdown();
}


// ==========================================
// COUNTDOWN
// ==========================================

function startCountdown() {
  if (gameOver === true) {
    return;
  }

  isCountdownActive = true;

  countdownArea.style.display = "block";

  let count = 3;
  countdownNumber.textContent = count;

  countdownInterval = setInterval(() => {
    count--;

    if (count > 0) {
      countdownNumber.textContent = count;
      return;
    }

    clearInterval(countdownInterval);
    countdownInterval = null;

    countdownArea.style.display = "none";

    isCountdownActive = false;

    revealResult();
  }, 1000);
}


// ==========================================
// REVEAL RESULT
// ==========================================

function revealResult() {
  if (gameOver === true) {
    return;
  }

  if (systemChoice === null) {
    return;
  }

  revealArea.style.display = "block";

  revealSystemState.textContent = systemChoice;

  systemEyeState.textContent = systemChoice;

  calculateResult();
}


// ==========================================
// CALCULATE RESULT
// ==========================================

function calculateResult() {
  if (resultProcessed === true) {
    return;
  }

  if (gameOver === true) {
    return;
  }

  resultProcessed = true;

  // ------------------------------------------
  // OPEN + OPEN = GAME OVER
  // ------------------------------------------

  if (playerChoice === "OPEN" && systemChoice === "OPEN") {

    resultGameOver.style.display = "block";

    const funnyMessage = getRandomMessage(messages.gameOver);

    statusMessage.textContent =
      "GAME OVER. EYE CONTACT DETECTED. " + funnyMessage;

    showGameOver();

    return;
  }


  // ------------------------------------------
  // OPEN + CLOSED = SURVIVE +1
  // ------------------------------------------

  if (playerChoice === "OPEN" && systemChoice === "CLOSED") {

    score++;
    roundsSurvived++;

    currentScoreDisplay.textContent = score;

    resultPoint.style.display = "block";

    continueKey = "ENTER";

    const funnyMessage = getRandomMessage(messages.riskySafe);

    statusMessage.textContent =
      "😑 THEY BLINKED! You survived. +1 POINT — " +
      funnyMessage +
      " — Press ENTER";

    return;
  }


  // ------------------------------------------
  // CLOSED + OPEN = SURVIVE +0
  // ------------------------------------------

  if (playerChoice === "CLOSED" && systemChoice === "OPEN") {

    roundsSurvived++;

    resultSafe.style.display = "block";

    continueKey = "SPACE";

    const funnyMessage = getRandomMessage(messages.closedOpen);

    statusMessage.textContent =
      "👀 THEY WERE WATCHING. You survived. +0 POINTS — " +
      funnyMessage +
      " — Press SPACE";

    return;
  }


  // ------------------------------------------
  // CLOSED + CLOSED = SURVIVE +0
  // ------------------------------------------

  if (playerChoice === "CLOSED" && systemChoice === "CLOSED") {

    roundsSurvived++;

    resultClosedSafe.style.display = "block";

    continueKey = "SPACE";

    const funnyMessage = getRandomMessage(messages.bothClosed);

    statusMessage.textContent =
      "😑 BOTH HID. You survived. +0 POINTS — " +
      funnyMessage +
      " — Press SPACE";

    return;
  }
}


// ==========================================
// GAME OVER
// ==========================================

function showGameOver() {
  gameOver = true;

  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  isCountdownActive = false;

  choiceOpenButton.disabled = true;
  choiceClosedButton.disabled = true;

  gameOverHeading.textContent = "GAME OVER";

  gameOverMessage.textContent = "EYE CONTACT DETECTED";

  const funnyMessage = getRandomMessage(messages.gameOver);

  gameOverSubmessage.textContent = funnyMessage;

  finalScoreValue.textContent = score;

  roundsSurvivedValue.textContent = roundsSurvived;

  finalHighScoreValue.textContent = highScoreDisplay.textContent;

  gameScreen.style.display = "none";
  gameOverScreen.style.display = "block";
}


// ==========================================
// RESTART
// ==========================================

function restartGame() {
  startGame();
}


// ==========================================
// BUTTON EVENTS
// ==========================================

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", restartGame);

choiceOpenButton.addEventListener("click", () => {
  selectPlayerChoice("OPEN");
});

choiceClosedButton.addEventListener("click", () => {
  selectPlayerChoice("CLOSED");
});


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener("keydown", (event) => {

  // ENTER = OPEN / CONTINUE
  if (event.key === "Enter") {

    if (gameOver === true) {
      return;
    }

    // Start screen
    if (startScreen.style.display !== "none") {
      startGame();
      return;
    }

    // Choose OPEN
    if (
      gameScreen.style.display !== "none" &&
      playerChoice === null &&
      isCountdownActive === false
    ) {
      selectPlayerChoice("OPEN");
      return;
    }

    // Continue after OPEN + CLOSED
    if (
      gameScreen.style.display !== "none" &&
      resultProcessed === true &&
      continueKey === "ENTER"
    ) {
      startNextRound();
      return;
    }
  }


  // SPACE = CLOSED / CONTINUE
  if (event.code === "Space") {

    if (gameOver === true) {
      return;
    }

    event.preventDefault();

    // Choose CLOSED
    if (
      gameScreen.style.display !== "none" &&
      playerChoice === null &&
      isCountdownActive === false
    ) {
      selectPlayerChoice("CLOSED");
      return;
    }

    // Continue after CLOSED results
    if (
      gameScreen.style.display !== "none" &&
      resultProcessed === true &&
      continueKey === "SPACE"
    ) {
      startNextRound();
      return;
    }
  }


  // R = RESTART
  if (event.key.toLowerCase() === "r") {
    restartGame();
    return;
  }


  // SHIFT
  // Existing SHIFT behavior remains unchanged.
  if (event.key === "Shift") {
    return;
  }
});