// ==============================
// GAME STATE
// ==============================

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


// ==============================
// HIGH SCORE
// ==============================

const HIGH_SCORE_KEY = "eyeRouletteHighScore";

let highScore = 0;


// ==============================
// FUNNY MESSAGES
// ==============================

const messages = {
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


function getRandomMessage(messageList) {
  const randomIndex = Math.floor(Math.random() * messageList.length);
  return messageList[randomIndex];
}


// ==============================
// DOM ELEMENTS
// ==============================

const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");

const gameScreen = document.getElementById("game-screen");

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
const revealSurvivalState = document.getElementById("reveal-survival-state");
const revealPointState = document.getElementById("reveal-point-state");
const revealCaughtState = document.getElementById("reveal-caught-state");

const resultStates = document.getElementById("result-states");
const resultSafe = document.getElementById("result-safe");
const resultPoint = document.getElementById("result-point");
const resultClosedSafe = document.getElementById("result-closed-safe");
const resultGameOver = document.getElementById("result-game-over");

const statusMessage = document.getElementById("status-message");

const gameOverScreen = document.getElementById("game-over-screen");
const gameOverHeading = document.getElementById("game-over-heading");
const gameOverMessage = document.getElementById("game-over-message");
const gameOverSubmessage = document.getElementById("game-over-submessage");

const finalScoreValue = document.getElementById("final-score-value");
const roundsSurvivedValue = document.getElementById("rounds-survived-value");
const finalHighScoreValue = document.getElementById("final-high-score-value");
const newHighScoreMessage = document.getElementById("new-high-score-message");

const restartButton = document.getElementById("restart-button");


// ==============================
// HIGH SCORE FUNCTIONS
// ==============================

function loadHighScore() {
  try {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);

    if (savedHighScore === null) {
      highScore = 0;
      return;
    }

    const parsedHighScore = Number(savedHighScore);

    if (Number.isFinite(parsedHighScore) && parsedHighScore >= 0) {
      highScore = Math.floor(parsedHighScore);
    } else {
      highScore = 0;
    }
  } catch (error) {
    highScore = 0;
  }
}


function saveHighScore() {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
  } catch (error) {
    // The game should continue even if localStorage is unavailable.
  }
}


function updateHighScoreDisplay() {
  highScoreDisplay.textContent = highScore;
  finalHighScoreValue.textContent = highScore;
}


function checkForNewHighScore() {
  const previousHighScore = highScore;

  if (score > highScore) {
    highScore = score;
    saveHighScore();
  }

  updateHighScoreDisplay();

  return score > previousHighScore;
}


// ==============================
// START GAME
// ==============================

function startGame() {
  score = 0;
  roundNumber = 1;
  roundsSurvived = 0;

  playerChoice = null;
  systemChoice = null;

  countdownInterval = null;
  isCountdownActive = false;
  resultProcessed = false;
  gameOver = false;
  continueKey = null;

  startScreen.hidden = true;
  gameScreen.hidden = false;
  gameOverScreen.hidden = true;

  newHighScoreMessage.hidden = true;

  updateHighScoreDisplay();

  startRound();
}


// ==============================
// START ROUND
// ==============================

function startRound() {
  playerChoice = null;
  systemChoice = null;

  isCountdownActive = false;
  resultProcessed = false;
  continueKey = null;

  systemEyeState.textContent = "???";

  countdownArea.hidden = true;
  revealArea.hidden = true;
  resultStates.hidden = true;

  resultSafe.hidden = true;
  resultPoint.hidden = true;
  resultClosedSafe.hidden = true;
  resultGameOver.hidden = true;

  choiceOpenButton.disabled = false;
  choiceClosedButton.disabled = false;

  choiceOpenButton.classList.remove("selected");
  choiceClosedButton.classList.remove("selected");

  statusMessage.textContent = "";

  roundNumberDisplay.textContent = roundNumber;
  currentScoreDisplay.textContent = score;
  updateHighScoreDisplay();
}


// ==============================
// START NEXT ROUND
// ==============================

function startNextRound() {
  if (resultProcessed && !gameOver) {
    roundNumber += 1;
    startRound();
  }
}


// ==============================
// PLAYER CHOICE
// ==============================

function selectPlayerChoice(choice) {
  if (playerChoice !== null || isCountdownActive || gameOver) {
    return;
  }

  playerChoice = choice;

  if (choice === "OPEN") {
    choiceOpenButton.classList.add("selected");
  }

  if (choice === "CLOSED") {
    choiceClosedButton.classList.add("selected");
  }

  choiceOpenButton.disabled = true;
  choiceClosedButton.disabled = true;

  systemChoice = Math.random() < 0.5 ? "OPEN" : "CLOSED";

  startCountdown();
}


// ==============================
// COUNTDOWN
// ==============================

function startCountdown() {
  if (isCountdownActive) {
    return;
  }

  isCountdownActive = true;

  countdownArea.hidden = false;
  countdownNumber.textContent = "3";

  let countdownValue = 3;

  countdownInterval = setInterval(() => {
    countdownValue -= 1;

    if (countdownValue > 0) {
      countdownNumber.textContent = countdownValue;
      return;
    }

    clearInterval(countdownInterval);
    countdownInterval = null;

    countdownArea.hidden = true;
    isCountdownActive = false;

    revealResult();
  }, 1000);
}


// ==============================
// REVEAL RESULT
// ==============================

function revealResult() {
  revealArea.hidden = false;

  systemEyeState.textContent = systemChoice;

  revealSystemState.textContent =
    `System chose: ${systemChoice}`;

  calculateResult();
}


// ==============================
// CALCULATE RESULT
// ==============================

function calculateResult() {
  if (resultProcessed) {
    return;
  }

  resultProcessed = true;

  resultStates.hidden = false;

  const funnyMessage = getRandomMessage(
    playerChoice === "OPEN" && systemChoice === "CLOSED"
      ? messages.riskySafe
      : playerChoice === "CLOSED" && systemChoice === "OPEN"
        ? messages.closedOpen
        : messages.bothClosed
  );


  // OPEN + OPEN = GAME OVER
  if (playerChoice === "OPEN" && systemChoice === "OPEN") {
    revealSurvivalState.textContent =
      "You were caught making eye contact.";

    revealPointState.textContent =
      "Points this round: +0";

    revealCaughtState.textContent =
      "GAME OVER";

    resultGameOver.hidden = false;

    gameOver = true;

    showGameOver();

    return;
  }


  // OPEN + CLOSED = SURVIVE +1
  if (playerChoice === "OPEN" && systemChoice === "CLOSED") {
    score += 1;
    roundsSurvived += 1;

    revealSurvivalState.textContent =
      "They blinked first. You survived.";

    revealPointState.textContent =
      "Points this round: +1";

    revealCaughtState.textContent =
      "";

    resultPoint.hidden = false;

    currentScoreDisplay.textContent = score;

    continueKey = "ENTER";

    statusMessage.textContent =
      `😑 THEY BLINKED! You survived. +1 POINT — ${funnyMessage} — Press ENTER`;

    return;
  }


  // CLOSED + OPEN = SURVIVE +0
  if (playerChoice === "CLOSED" && systemChoice === "OPEN") {
    roundsSurvived += 1;

    revealSurvivalState.textContent =
      "You survived by keeping your eyes closed.";

    revealPointState.textContent =
      "Points this round: +0";

    revealCaughtState.textContent =
      "";

    resultClosedSafe.hidden = false;

    continueKey = "SPACE";

    statusMessage.textContent =
      `👀 THEY WERE WATCHING. You survived. +0 POINTS — ${funnyMessage} — Press SPACE`;

    return;
  }


  // CLOSED + CLOSED = SURVIVE +0
  if (playerChoice === "CLOSED" && systemChoice === "CLOSED") {
    roundsSurvived += 1;

    revealSurvivalState.textContent =
      "Nobody looked. You survived.";

    revealPointState.textContent =
      "Points this round: +0";

    revealCaughtState.textContent =
      "";

    resultClosedSafe.hidden = false;

    continueKey = "SPACE";

    statusMessage.textContent =
      `😑 BOTH HID. You survived. +0 POINTS — ${funnyMessage} — Press SPACE`;

    return;
  }
}


// ==============================
// GAME OVER
// ==============================

function showGameOver() {
  const isNewHighScore = checkForNewHighScore();

  gameScreen.hidden = true;
  gameOverScreen.hidden = false;

  gameOverHeading.textContent = "GAME OVER";
  gameOverMessage.textContent = "EYE CONTACT DETECTED";

  gameOverSubmessage.textContent =
    getRandomMessage(messages.gameOver);

  finalScoreValue.textContent = score;
  roundsSurvivedValue.textContent = roundsSurvived;
  finalHighScoreValue.textContent = highScore;

  newHighScoreMessage.hidden = !isNewHighScore;

  statusMessage.textContent =
    `GAME OVER. EYE CONTACT DETECTED. ${getRandomMessage(messages.gameOver)}`;
}


// ==============================
// RESTART GAME
// ==============================

function restartGame() {
  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  score = 0;
  roundNumber = 1;
  roundsSurvived = 0;

  playerChoice = null;
  systemChoice = null;

  isCountdownActive = false;
  resultProcessed = false;
  gameOver = false;
  continueKey = null;

  newHighScoreMessage.hidden = true;

  gameOverScreen.hidden = true;
  startScreen.hidden = false;
  gameScreen.hidden = true;

  updateHighScoreDisplay();
}


// ==============================
// BUTTON LISTENERS
// ==============================

startButton.addEventListener("click", startGame);

choiceOpenButton.addEventListener("click", () => {
  selectPlayerChoice("OPEN");
});

choiceClosedButton.addEventListener("click", () => {
  selectPlayerChoice("CLOSED");
});

restartButton.addEventListener("click", restartGame);


// ==============================
// KEYBOARD CONTROLS
// ==============================

document.addEventListener("keydown", (event) => {

  // ENTER
  if (event.key === "Enter") {

    if (!startScreen.hidden) {
      startGame();
      return;
    }

    if (
      !gameOver &&
      !isCountdownActive &&
      playerChoice === null
    ) {
      selectPlayerChoice("OPEN");
      return;
    }

    if (
      !gameOver &&
      continueKey === "ENTER"
    ) {
      startNextRound();
      return;
    }
  }


  // SPACE
  if (event.code === "Space") {
    event.preventDefault();

    if (
      !gameOver &&
      !isCountdownActive &&
      playerChoice === null
    ) {
      selectPlayerChoice("CLOSED");
      return;
    }

    if (
      !gameOver &&
      continueKey === "SPACE"
    ) {
      startNextRound();
      return;
    }
  }


  // R
  if (event.key.toLowerCase() === "r") {
    restartGame();
    return;
  }


  // SHIFT
  if (event.key === "Shift") {
    // Existing SHIFT behavior remains unchanged.
    return;
  }
});


// ==============================
// INITIALIZE
// ==============================

loadHighScore();
updateHighScoreDisplay();