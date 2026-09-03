// Eye Roulette 👀
// MILESTONE 6: Final Game Logic

let playerChoice = null;
let systemChoice = null;

let score = 0;
let roundNumber = 1;
let roundsSurvived = 0;

let isCountdownActive = false;
let countdownInterval = null;
let resultProcessed = false;

// Get screens
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

// Get buttons
const startButton = document.getElementById("start-button");
const openButton = document.getElementById("choice-open");
const closedButton = document.getElementById("choice-closed");
const restartButton = document.getElementById("restart-button");

// Get game display elements
const roundNumberDisplay = document.getElementById("round-number");
const currentScoreDisplay = document.getElementById("current-score");

const systemEyeState = document.getElementById("system-eye-state");
const statusMessage = document.getElementById("status-message");

const countdownArea = document.getElementById("countdown-area");
const countdownNumber = document.getElementById("countdown-number");

const revealArea = document.getElementById("reveal-area");
const revealSystemState = document.getElementById("reveal-system-state");

// Get result containers
const resultSafe = document.getElementById("result-safe");
const resultPoint = document.getElementById("result-point");
const resultClosedSafe = document.getElementById("result-closed-safe");
const resultGameOver = document.getElementById("result-game-over");

// Get game-over display elements
const finalScoreValue = document.getElementById("final-score-value");
const roundsSurvivedValue = document.getElementById("rounds-survived-value");
const finalHighScoreValue = document.getElementById("final-high-score-value");


// Start the game
function startGame() {
  score = 0;
  roundNumber = 1;
  roundsSurvived = 0;

  updateScoreDisplay();
  updateRoundDisplay();

  startScreen.hidden = true;
  gameOverScreen.hidden = true;
  gameScreen.hidden = false;

  startRound();
}


// Start a new round
function startRound() {
  // Reset round-specific state
  playerChoice = null;
  systemChoice = null;

  isCountdownActive = false;
  resultProcessed = false;

  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  // Reset buttons
  openButton.disabled = false;
  closedButton.disabled = false;

  openButton.classList.remove("selected");
  closedButton.classList.remove("selected");

  // Keep system state hidden
  systemEyeState.textContent = "???";

  // Reset countdown
  countdownNumber.textContent = "3";
  countdownArea.hidden = true;

  // Hide reveal
  revealArea.hidden = true;
  revealSystemState.textContent = "";

  // Hide all result containers
  hideAllResults();

  statusMessage.textContent =
    "Choose your claim: OPEN 👀 or CLOSED 😑";

  updateRoundDisplay();
  updateScoreDisplay();
}


// Player chooses OPEN or CLOSED
function selectPlayerChoice(choice) {

  // Don't allow another choice after one is made
  if (playerChoice !== null) {
    return;
  }

  // Don't allow choices during countdown
  if (isCountdownActive) {
    return;
  }

  // Save player's choice
  playerChoice = choice;

  // Mark the selected button
  openButton.classList.remove("selected");
  closedButton.classList.remove("selected");

  if (choice === "OPEN") {
    openButton.classList.add("selected");
    statusMessage.textContent = "You chose OPEN 👀";
  }

  if (choice === "CLOSED") {
    closedButton.classList.add("selected");
    statusMessage.textContent = "You chose CLOSED 😑";
  }

  // Disable both buttons
  openButton.disabled = true;
  closedButton.disabled = true;

  // Generate the system choice exactly once
  if (systemChoice === null) {
    systemChoice = Math.random() < 0.5 ? "OPEN" : "CLOSED";
  }

  console.log("Player choice:", playerChoice);
  console.log("System choice:", systemChoice);

  // Automatically begin countdown
  startCountdown();
}


// Start the countdown
function startCountdown() {

  // Prevent duplicate countdowns
  if (isCountdownActive) {
    return;
  }

  isCountdownActive = true;

  // Keep system state hidden
  systemEyeState.textContent = "???";

  // Hide previous reveal/result
  revealArea.hidden = true;
  hideAllResults();

  // Show countdown
  countdownArea.hidden = false;

  let countdown = 3;
  countdownNumber.textContent = countdown;

  countdownInterval = setInterval(function () {

    countdown--;

    if (countdown > 0) {
      countdownNumber.textContent = countdown;
    } else {
      // Stop timer
      clearInterval(countdownInterval);
      countdownInterval = null;

      isCountdownActive = false;

      // Reveal first, then calculate the result
      revealSystemChoice();
    }

  }, 1000);
}


// Reveal the existing system choice
function revealSystemChoice() {

  // Do NOT generate another random value.
  // Use the systemChoice that was already generated.

  if (systemChoice === "OPEN") {
    systemEyeState.textContent = "👀 OPEN";
    revealSystemState.textContent = "System: 👀 OPEN";
  }

  if (systemChoice === "CLOSED") {
    systemEyeState.textContent = "😑 CLOSED";
    revealSystemState.textContent = "System: 😑 CLOSED";
  }

  // Show reveal
  revealArea.hidden = false;

  // Hide countdown
  countdownArea.hidden = true;

  // Now process the game rules
  calculateResult();
}


// Calculate the result exactly once
function calculateResult() {

  // Prevent duplicate result processing
  if (resultProcessed) {
    return;
  }

  resultProcessed = true;

  // --------------------------------
  // RULE 1: OPEN + OPEN
  // --------------------------------
  if (
    playerChoice === "OPEN" &&
    systemChoice === "OPEN"
  ) {
    showResultGameOver();
    return;
  }


  // --------------------------------
  // RULE 2: OPEN + CLOSED
  // --------------------------------
  if (
    playerChoice === "OPEN" &&
    systemChoice === "CLOSED"
  ) {
    score += 1;
    roundsSurvived += 1;

    updateScoreDisplay();

    resultPoint.hidden = false;

    statusMessage.textContent =
      "😑 THEY BLINKED! You survived. +1 POINT";

    return;
  }


  // --------------------------------
  // RULE 3: CLOSED + OPEN
  // --------------------------------
  if (
    playerChoice === "CLOSED" &&
    systemChoice === "OPEN"
  ) {
    roundsSurvived += 1;

    resultClosedSafe.hidden = false;

    statusMessage.textContent =
      "👀 THEY WERE WATCHING. You survived. +0 POINTS";

    return;
  }


  // --------------------------------
  // RULE 4: CLOSED + CLOSED
  // --------------------------------
  if (
    playerChoice === "CLOSED" &&
    systemChoice === "CLOSED"
  ) {
    roundsSurvived += 1;

    resultClosedSafe.hidden = false;

    statusMessage.textContent =
      "😑 BOTH HID. You survived. +0 POINTS";

    return;
  }
}


// Show game-over result
function showResultGameOver() {

  resultGameOver.hidden = false;

  statusMessage.textContent =
    "👀 EYE CONTACT! You got caught. Game Over.";

  // Update game-over screen values
  finalScoreValue.textContent = score;
  roundsSurvivedValue.textContent = roundsSurvived;
  finalHighScoreValue.textContent = score;

  // Stop the current game screen
  gameScreen.hidden = true;
  gameOverScreen.hidden = false;
}


// Continue to the next round
function continueToNextRound() {

  // Only allow continuing after a result
  if (!resultProcessed) {
    return;
  }

  // Do not continue if the game is over
  if (!gameOverScreen.hidden) {
    return;
  }

  roundNumber += 1;

  startRound();
}


// Hide all result containers
function hideAllResults() {
  resultSafe.hidden = true;
  resultPoint.hidden = true;
  resultClosedSafe.hidden = true;
  resultGameOver.hidden = true;
}


// Update score display
function updateScoreDisplay() {
  currentScoreDisplay.textContent = score;
}


// Update round display
function updateRoundDisplay() {
  roundNumberDisplay.textContent = roundNumber;
}


// Restart after game over
function restartGame() {
  gameOverScreen.hidden = true;
  gameScreen.hidden = false;

  startGame();
}


// -------------------------------
// BUTTON CONTROLS
// -------------------------------

startButton.addEventListener("click", startGame);

openButton.addEventListener("click", function () {
  selectPlayerChoice("OPEN");
});

closedButton.addEventListener("click", function () {
  selectPlayerChoice("CLOSED");
});

restartButton.addEventListener("click", restartGame);


// -------------------------------
// KEYBOARD CONTROLS
// -------------------------------

document.addEventListener("keydown", function (event) {

  // ENTER
  if (event.key === "Enter") {
    event.preventDefault();

    // Start game from start screen
    if (!startScreen.hidden) {
      startGame();
      return;
    }

    // Ignore ENTER during countdown
    if (isCountdownActive) {
      return;
    }

    // If game over, do nothing.
    // Restart uses R.
    if (!gameOverScreen.hidden) {
      return;
    }

    // If no choice has been made, ENTER chooses OPEN
    if (playerChoice === null) {
      selectPlayerChoice("OPEN");
      return;
    }

    // After a safe result, ENTER continues
    if (resultProcessed) {
      continueToNextRound();
    }

    return;
  }


  // SPACE
  if (event.code === "Space") {
    event.preventDefault();

    // Ignore SPACE outside the game
    if (!gameOverScreen.hidden || !startScreen.hidden) {
      return;
    }

    // Ignore SPACE during countdown
    if (isCountdownActive) {
      return;
    }

    // If no choice has been made, SPACE chooses CLOSED
    if (playerChoice === null) {
      selectPlayerChoice("CLOSED");
      return;
    }

    // After a safe result, SPACE continues
    if (resultProcessed) {
      continueToNextRound();
    }

    return;
  }


  // R = restart after game over
  if (event.key.toLowerCase() === "r") {
    if (!gameOverScreen.hidden) {
      event.preventDefault();
      restartGame();
    }

    return;
  }


  // Any other key does nothing
});