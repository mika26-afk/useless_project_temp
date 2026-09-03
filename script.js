// Eye Roulette 👀
// MILESTONE 7: ROUND PROGRESSION

let playerChoice = null;
let systemChoice = null;

let score = 0;
let roundNumber = 1;
let roundsSurvived = 0;

let isCountdownActive = false;
let countdownInterval = null;
let resultProcessed = false;

// Stores which key can continue after a safe result
let continueKey = null;


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

  // Only continue if the current round has finished safely
  if (!resultProcessed) {
    return;
  }

  // Do not continue after game over
  if (!gameOverScreen.hidden) {
    return;
  }

  // Increase round exactly once
  roundNumber += 1;

  // Reset the temporary state and prepare the new round
  startRound();
}


// Player chooses OPEN or CLOSED
function selectPlayerChoice(choice) {

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

      // Stop timer
      clearInterval(countdownInterval);
      countdownInterval = null;

      isCountdownActive = false;

      // Reveal first
      revealSystemChoice();
    }

  }, 1000);
}


// Reveal existing system choice
function revealSystemChoice() {

  // Do NOT randomize again.
  // Use the systemChoice already generated for this round.

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

  // Process the result exactly once
  calculateResult();
}


// Calculate the result
function calculateResult() {

  // Prevent duplicate result processing
  if (resultProcessed) {
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
    showResultGameOver();
    return;
  }


  // --------------------------------
  // OPEN + CLOSED = +1
  // ENTER continues
  // --------------------------------
  if (
    playerChoice === "OPEN" &&
    systemChoice === "CLOSED"
  ) {
    score += 1;
    roundsSurvived += 1;

    // ENTER is the only continuation key
    continueKey = "ENTER";

    updateScoreDisplay();

    resultPoint.hidden = false;

    statusMessage.textContent =
      "😑 THEY BLINKED! You survived. +1 POINT — Press ENTER";

    return;
  }


  // --------------------------------
  // CLOSED + OPEN = +0
  // SPACE continues
  // --------------------------------
  if (
    playerChoice === "CLOSED" &&
    systemChoice === "OPEN"
  ) {
    roundsSurvived += 1;

    // SPACE is the only continuation key
    continueKey = "SPACE";

    resultClosedSafe.hidden = false;

    statusMessage.textContent =
      "👀 THEY WERE WATCHING. You survived. +0 POINTS — Press SPACE";

    return;
  }


  // --------------------------------
  // CLOSED + CLOSED = +0
  // SPACE continues
  // --------------------------------
  if (
    playerChoice === "CLOSED" &&
    systemChoice === "CLOSED"
  ) {
    roundsSurvived += 1;

    // SPACE is the only continuation key
    continueKey = "SPACE";

    resultClosedSafe.hidden = false;

    statusMessage.textContent =
      "😑 BOTH HID. You survived. +0 POINTS — Press SPACE";

    return;
  }
}


// Show game-over result
function showResultGameOver() {

  resultGameOver.hidden = false;

  // No continuation key after game over
  continueKey = null;

  statusMessage.textContent =
    "👀 EYE CONTACT! You got caught. Game Over.";

  // Update game-over information
  finalScoreValue.textContent = score;
  roundsSurvivedValue.textContent = roundsSurvived;
  finalHighScoreValue.textContent = score;

  // Stop the current game
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


// Restart after game over
function restartGame() {
  gameOverScreen.hidden = true;
  gameScreen.hidden = false;

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

    // Ignore ENTER during countdown
    if (isCountdownActive) {
      return;
    }

    // Ignore ENTER after game over
    if (!gameOverScreen.hidden) {
      return;
    }

    // No player choice yet:
    // ENTER chooses OPEN
    if (playerChoice === null) {
      selectPlayerChoice("OPEN");
      return;
    }

    // After a result:
    // ENTER only continues if ENTER is the correct key
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

    // After a result:
    // SPACE only continues if SPACE is the correct key
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

    if (!gameOverScreen.hidden) {
      event.preventDefault();
      restartGame();
    }

    return;
  }


  // -------------------------------
  // SHIFT
  // -------------------------------
  if (event.key === "Shift") {
    // Preserve SHIFT as an available game control.
    // No additional round progression happens here.
    return;
  }


  // Any other key does nothing
});