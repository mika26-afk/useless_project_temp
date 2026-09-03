// Eye Roulette 👀
// MILESTONE 5: Countdown + System Reveal

let playerChoice = null;
let systemChoice = null;

let isCountdownActive = false;
let countdownInterval = null;

// Get elements
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

const startButton = document.getElementById("start-button");
const openButton = document.getElementById("choice-open");
const closedButton = document.getElementById("choice-closed");

const statusMessage = document.getElementById("status-message");

const systemEyeState = document.getElementById("system-eye-state");

const countdownArea = document.getElementById("countdown-area");
const countdownNumber = document.getElementById("countdown-number");

const revealArea = document.getElementById("reveal-area");
const revealSystemState = document.getElementById("reveal-system-state");


// Start game / new round
function startGame() {
  // Reset choices for a new round
  playerChoice = null;
  systemChoice = null;

  // Reset countdown state
  isCountdownActive = false;

  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  startScreen.hidden = true;
  gameScreen.hidden = false;

  // Reset buttons
  openButton.disabled = false;
  closedButton.disabled = false;

  openButton.classList.remove("selected");
  closedButton.classList.remove("selected");

  // Keep system state hidden
  systemEyeState.textContent = "???";

  // Reset countdown and hide it
  countdownNumber.textContent = "3";
  countdownArea.hidden = true;

  // Hide reveal area until countdown finishes
  revealArea.hidden = true;
  revealSystemState.textContent = "";

  statusMessage.textContent = "Choose your claim: OPEN 👀 or CLOSED 😑";
}


// Player chooses OPEN or CLOSED
function selectPlayerChoice(choice) {

  // Don't allow another choice after one is made
  if (playerChoice !== null) {
    return;
  }

  // Don't allow choices while countdown is running
  if (isCountdownActive) {
    return;
  }

  // Save the player's choice
  playerChoice = choice;

  // Remove previous selection
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

  // Disable both buttons after choosing
  openButton.disabled = true;
  closedButton.disabled = true;

  // Generate the system choice exactly once
  if (systemChoice === null) {
    systemChoice = Math.random() < 0.5 ? "OPEN" : "CLOSED";
  }

  console.log("Player choice:", playerChoice);
  console.log("System choice:", systemChoice);

  // Start countdown automatically
  startCountdown();
}


// Start the 3-second countdown
function startCountdown() {

  // Prevent duplicate countdowns
  if (isCountdownActive) {
    return;
  }

  isCountdownActive = true;

  // Keep system state hidden
  systemEyeState.textContent = "???";

  // Hide any previous reveal
  revealArea.hidden = true;
  revealSystemState.textContent = "";

  // Show countdown
  countdownArea.hidden = false;
  countdownNumber.textContent = "3";

  let countdown = 3;

  countdownInterval = setInterval(function () {

    countdown--;

    if (countdown > 0) {
      countdownNumber.textContent = countdown;
    } else {
      // Countdown has finished
      clearInterval(countdownInterval);
      countdownInterval = null;

      isCountdownActive = false;

      revealSystemChoice();
    }

  }, 1000);
}


// Reveal the already-generated system choice
function revealSystemChoice() {

  // Make sure we use the existing systemChoice.
  // DO NOT generate another random value here.

  if (systemChoice === "OPEN") {
    systemEyeState.textContent = "👀 OPEN";
    revealSystemState.textContent = "System: 👀 OPEN";
  }

  if (systemChoice === "CLOSED") {
    systemEyeState.textContent = "😑 CLOSED";
    revealSystemState.textContent = "System: 😑 CLOSED";
  }

  // Show the reveal area
  revealArea.hidden = false;

  // Hide countdown after it finishes
  countdownArea.hidden = true;

  statusMessage.textContent =
    `You chose ${playerChoice}. The system has revealed its state.`;

  console.log("Reveal:", systemChoice);

  // IMPORTANT:
  // This is where this milestone stops.
  // No result calculation.
  // No scoring.
  // No game over.
  // No next round.
}


// Button controls
startButton.addEventListener("click", startGame);

openButton.addEventListener("click", function () {
  selectPlayerChoice("OPEN");
});

closedButton.addEventListener("click", function () {
  selectPlayerChoice("CLOSED");
});


// Keyboard controls
document.addEventListener("keydown", function (event) {

  // ENTER
  if (event.key === "Enter") {
    event.preventDefault();

    // If game hasn't started, ENTER starts it
    if (gameScreen.hidden) {
      startGame();
    }
    // During the game, ENTER attempts to choose OPEN.
    // The function will ignore it if countdown is active.
    else {
      selectPlayerChoice("OPEN");
    }

    return;
  }


  // SPACE
  if (event.code === "Space") {
    event.preventDefault();

    // During the game, SPACE attempts to choose CLOSED.
    // The function will ignore it if countdown is active.
    if (!gameScreen.hidden) {
      selectPlayerChoice("CLOSED");
    }

    return;
  }

  // Any other key does nothing
});