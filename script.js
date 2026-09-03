// Eye Roulette 👀
// PLAYER CHOICE + RANDOM SYSTEM CHOICE

let playerChoice = null;
let systemChoice = null;

// Get elements
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

const startButton = document.getElementById("start-button");
const openButton = document.getElementById("choice-open");
const closedButton = document.getElementById("choice-closed");

const statusMessage = document.getElementById("status-message");
const systemEyeState = document.getElementById("system-eye-state");

// Start game / round
function startGame() {
  // Reset both choices for a new round
  playerChoice = null;
  systemChoice = null;

  startScreen.hidden = true;
  gameScreen.hidden = false;

  openButton.disabled = false;
  closedButton.disabled = false;

  openButton.classList.remove("selected");
  closedButton.classList.remove("selected");

  // Keep the system state hidden
  systemEyeState.textContent = "???";

  statusMessage.textContent = "Choose your claim: OPEN 👀 or CLOSED 😑";
}

// Player chooses OPEN or CLOSED
function selectPlayerChoice(choice) {

  // Don't allow another player choice after one is made
  if (playerChoice !== null) {
    return;
  }

  // Save the player's choice
  playerChoice = choice;

  // Visually mark the selected button
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

  // IMPORTANT:
  // The system choice is stored internally only.
  // Do not reveal it on the screen.
  // No scoring, result, countdown, or game-over logic yet.
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
    } else {
      // During the game, ENTER chooses OPEN
      selectPlayerChoice("OPEN");
    }

    return;
  }

  // SPACE
  if (event.code === "Space") {
    event.preventDefault();

    // During the game, SPACE chooses CLOSED
    if (!gameScreen.hidden) {
      selectPlayerChoice("CLOSED");
    }

    return;
  }

  // Any other key does nothing
});