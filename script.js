// Eye Roulette 👀
// PLAYER CHOICE STAGE ONLY

let playerChoice = null;

// Get elements
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

const startButton = document.getElementById("start-button");
const openButton = document.getElementById("choice-open");
const closedButton = document.getElementById("choice-closed");

const statusMessage = document.getElementById("status-message");
const systemEyeState = document.getElementById("system-eye-state");

// Start game
function startGame() {
  playerChoice = null;

  startScreen.hidden = true;
  gameScreen.hidden = false;

  openButton.disabled = false;
  closedButton.disabled = false;

  openButton.classList.remove("selected");
  closedButton.classList.remove("selected");

  // Keep system state hidden
  systemEyeState.textContent = "???";

  statusMessage.textContent = "Choose your claim: OPEN 👀 or CLOSED 😑";
}

// Player chooses OPEN or CLOSED
function selectPlayerChoice(choice) {

  // Don't allow another choice after one is made
  if (playerChoice !== null) {
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

  console.log("Player choice:", playerChoice);

  // IMPORTANT:
  // Nothing else happens yet.
  // No reveal.
  // No score.
  // No computer state.
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

    // If game hasn't started, ENTER starts it.
    if (gameScreen.hidden) {
      startGame();
    }
    // Otherwise ENTER chooses OPEN.
    else {
      selectPlayerChoice("OPEN");
    }

    return;
  }

  // SPACE
  if (event.code === "Space") {
    event.preventDefault();

    // SPACE chooses CLOSED during the game.
    if (!gameScreen.hidden) {
      selectPlayerChoice("CLOSED");
    }

    return;
  }

  // Any other key does nothing.
});