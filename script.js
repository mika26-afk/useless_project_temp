// Eye Roulette 👀
// MILESTONE 8: POLISHED GAME OVER SCREEN

let playerChoice = null;
let systemChoice = null;

let score = 0;
let roundNumber = 1;
let roundsSurvived = 0;

let isCountdownActive = false;
let countdownInterval = null;
let resultProcessed = false;
let continueKey = null;
let gameOver = false;


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


// Start a completely new game
function startGame() {
  score = 0;
  roundNumber = 1;
  roundsSurvived = 0;

  playerChoice = null;
  systemChoice = null;

  isCountdownActive = false;
  resultProcessed = false;
  continueKey = null;
  gameOver = false;

  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  updateScoreDisplay();
  updateRoundDisplay();

  finalScoreValue.textContent = "0";
  roundsSurvivedValue.textContent = "0";
  finalHighScoreValue.textContent = "0";

  startScreen.hidden = true;
  gameOverScreen.hidden = true;
  gameScreen.hidden = false;

  startRound();
}


// Start a new round
function startRound() {

  // Reset temporary round state
  playerChoice = null;
  systemChoice = null;

  isCountdownActive = false;
  resultProcessed = false;
  continueKey = null;

  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  // Reset player buttons
  openButton.disabled = false;
  closedButton.disabled = false;

  openButton.classList.remove("selected");
  closedButton.classList.remove("selected");

  // Hide system state
  systemEyeState.textContent = "???";

  // Reset countdown
  countdownNumber.textContent = "3";
  countdownArea.hidden = true;

  // Hide reveal
  revealArea.hidden = true;
  revealSystemState.textContent = "";

  // Hide previous results
  hideAllResults();

  // Return to player-choice stage
  statusMessage.textContent =
    "Choose your claim: OPEN 👀 or CLOSED 😑";

  updateRoundDisplay();
  updateScoreDisplay();
}


// Start the next round
function startNextRound() {

  // Only continue after a completed safe result
  if (!resultProcessed) {
    return;
  }

  // Never continue after Game Over
  if (gameOver) {
    return;
  }

  // Increase the round exactly once
  roundNumber += 1;

  startRound();
}


// Player chooses OPEN or CLOSED
function selectPlayerChoice(choice) {

  // Game Over is a terminal state
  if (gameOver) {
    return;
  }

  // Don't allow another choice after one has been made
  if (playerChoice !== null) {
    return;
  }

  // Don't allow choices during countdown
  if (isCountdownActive) {
    return;
  }

  // Save player choice
  playerChoice = choice;

  // Mark selected button
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

  // Generate system choice exactly once
  if (systemChoice === null) {
    systemChoice = Math.random() < 0.5 ? "OPEN" : "CLOSED";
  }

  console.log("Player choice:", playerChoice);
  console.log("System choice:", systemChoice);

  // Start countdown automatically
  startCountdown();
}


// Start countdown
function startCountdown() {

  if (gameOver) {
    return;
  }

  // Prevent duplicate countdowns
  if (isCountdownActive) {
    return;
  }

  isCountdownActive = true;

  // Keep system hidden
  systemEyeState.textContent = "???";

  revealArea.hidden = true;
  hideAllResults();

  countdownArea.hidden = false;

  let countdown = 3;
  countdownNumber.textContent = countdown;

  countdownInterval = setInterval(function () {

    countdown--;

    if (countdown > 0) {
      countdownNumber.textContent = countdown;
    } else {

      clearInterval(countdownInterval);
      countdownInterval = null;

      isCountdownActive = false;

      // Reveal the existing system choice
      revealSystemChoice();
    }

  }, 1000);
}


// Reveal existing system choice
function revealSystemChoice() {

  // Don't process anything after Game Over
  if (gameOver) {
    return;
  }

  // Do NOT randomize again
  if (systemChoice === "OPEN") {
    systemEyeState.textContent = "👀 OPEN";
    revealSystemState.textContent = "System: 👀 OPEN";
  }

  if (systemChoice === "CLOSED") {
    systemEyeState.textContent = "😑 CLOSED";
    revealSystemState.textContent = "System: 😑 CLOSED";
  }

  revealArea.hidden = false;
  countdownArea.hidden = true;

  calculateResult();
}


// Calculate the result
function calculateResult() {

  // Prevent duplicate result processing
  if (resultProcessed || gameOver) {
    return;
  }

  resultProcessed = true;

  // --------------------------------
  // OPEN + OPEN = GAME OVER
  // --------------------------------
  if (
    playerChoice === "OPEN" &&
    systemChoice === "OPEN"
  ) {
    showGameOver();
    return;
  }


  // --------------------------------
  // OPEN + CLOSED = +1
  // --------------------------------
  if (
    playerChoice === "OPEN" &&
    systemChoice === "CLOSED"
  ) {
    score += 1;
    roundsSurvived += 1;

    continueKey = "ENTER";

    updateScoreDisplay();

    resultPoint.hidden = false;

    statusMessage.textContent =
      "😑 THEY BLINKED! You survived. +1 POINT — Press ENTER";

    return;
  }


  // --------------------------------
  // CLOSED + OPEN = +0
  // --------------------------------
  if (
    playerChoice === "CLOSED" &&
    systemChoice === "OPEN"
  ) {
    roundsSurvived += 1;

    continueKey = "SPACE";

    resultClosedSafe.hidden = false;

    statusMessage.textContent =
      "👀 THEY WERE WATCHING. You survived. +0 POINTS — Press SPACE";

    return;
  }


  // --------------------------------
  // CLOSED + CLOSED = +0
  // --------------------------------
  if (
    playerChoice === "CLOSED" &&
    systemChoice === "CLOSED"
  ) {
    roundsSurvived += 1;

    continueKey = "SPACE";

    resultClosedSafe.hidden = false;

    statusMessage.textContent =
      "😑 BOTH HID. You survived. +0 POINTS — Press SPACE";

    return;
  }
}


// Show Game Over
function showGameOver() {

  // Prevent Game Over from being processed twice
  if (gameOver) {
    return;
  }

  gameOver = true;

  // Stop countdown if one somehow remains active
  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  isCountdownActive = false;
  continueKey = null;

  // Make sure player cannot interact with the old game
  openButton.disabled = true;
  closedButton.disabled = true;

  // Display final values
  finalScoreValue.textContent = score;
  roundsSurvivedValue.textContent = roundsSurvived;
  finalHighScoreValue.textContent = score;

  // Update status before leaving the game screen
  statusMessage.textContent =
    "💀 GAME OVER — EYE CONTACT DETECTED";

  // Show Game Over screen
  gameScreen.hidden = true;
  gameOverScreen.hidden = false;
}


// Hide all result containers
function hideAllResults() {
  resultSafe.hidden = true;
  resultPoint.hidden = true;
  resultClosedSafe.hidden = true;
  resultGameOver.hidden = true;
}


// Update score
function updateScoreDisplay() {
  currentScoreDisplay.textContent = score;
}


// Update round number
function updateRoundDisplay() {
  roundNumberDisplay.textContent = roundNumber;
}


// Restart after Game Over
function restartGame() {
  startGame();
}


// Button controls
startButton.addEventListener("click", startGame);

openButton.addEventListener("click", function () {
  selectPlayerChoice("OPEN");
});

closedButton.addEventListener("click", function () {
  selectPlayerChoice("CLOSED");
});

restartButton.addEventListener("click", restartGame);


// Keyboard controls
document.addEventListener("keydown", function (event) {

  // -------------------------------
  // ENTER
  // -------------------------------
  if (event.key === "Enter") {
    event.preventDefault();

    // ENTER starts the game from the start screen
    if (!startScreen.hidden) {
      startGame();
      return;
    }

    // Game Over: ENTER does nothing
    if (gameOver) {
      return;
    }

    // Ignore ENTER during countdown
    if (isCountdownActive) {
      return;
    }

    // No player choice yet:
    // ENTER chooses OPEN
    if (playerChoice === null) {
      selectPlayerChoice("OPEN");
      return;
    }

    // After a safe result:
    // ENTER continues only when ENTER is the correct key
    if (
      resultProcessed &&
      continueKey === "ENTER"
    ) {
      startNextRound();
    }

    return;
  }


  // -------------------------------
  // SPACE
  // -------------------------------
  if (event.code === "Space") {
    event.preventDefault();

    // Game Over: SPACE does nothing
    if (gameOver) {
      return;
    }

    // Ignore SPACE outside the game
    if (!startScreen.hidden || !gameOverScreen.hidden) {
      return;
    }

    // Ignore SPACE during countdown
    if (isCountdownActive) {
      return;
    }

    // No player choice yet:
    // SPACE chooses CLOSED
    if (playerChoice === null) {
      selectPlayerChoice("CLOSED");
      return;
    }

    // After a safe result:
    // SPACE continues only when SPACE is the correct key
    if (
      resultProcessed &&
      continueKey === "SPACE"
    ) {
      startNextRound();
    }

    return;
  }


  // -------------------------------
  // R = RESTART AFTER GAME OVER
  // -------------------------------
  if (event.key.toLowerCase() === "r") {

    if (gameOver) {
      event.preventDefault();
      restartGame();
    }

    return;
  }


  // -------------------------------
  // SHIFT
  // -------------------------------
  if (event.key === "Shift") {
    // Existing SHIFT behavior is preserved.
    return;
  }


  // Any other key does nothing
});