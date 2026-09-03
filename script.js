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

// Each new round gets a new token.
// Async callbacks must match the current token
// before they are allowed to change game state.
let roundToken = 0;


// ==============================
// OVERLAY STATE
// ==============================

let resultOverlayTimeout = null;
let resultOverlay = null;
let resultOverlayVisible = false;


// ==============================
// LIGHTWEIGHT ARCADE SOUNDS
// ==============================

let audioContext = null;
let audioMaster = null;

const activeAudioOscillators = new Set();


function initAudio() {

  if (audioContext) {
    return;
  }

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    audioContext =
      new AudioContext();

    audioMaster =
      audioContext.createGain();

    audioMaster.gain.value =
      0.12;

    audioMaster.connect(
      audioContext.destination
    );

  } catch (error) {

    audioContext = null;
    audioMaster = null;

  }

}


function stopAllAudio() {

  activeAudioOscillators.forEach(
    (oscillator) => {

      try {

        oscillator.stop();

      } catch (error) {

        // Already stopped.

      }

    }
  );

  activeAudioOscillators.clear();

}


function playTone(
  frequency,
  duration = 0.08,
  type = "square",
  volume = 0.5
) {

  if (
    !audioContext ||
    !audioMaster
  ) {

    return;

  }


  try {

    if (
      audioContext.state ===
      "suspended"
    ) {

      audioContext
        .resume()
        .catch(() => {});

    }


    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();


    oscillator.type =
      type;


    oscillator.frequency.value =
      frequency;


    const now =
      audioContext.currentTime;


    gain.gain.setValueAtTime(
      0,
      now
    );


    gain.gain.linearRampToValueAtTime(
      volume,
      now + 0.005
    );


    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + duration
    );


    oscillator.connect(gain);

    gain.connect(audioMaster);


    activeAudioOscillators.add(
      oscillator
    );


    oscillator.addEventListener(
      "ended",
      () => {

        activeAudioOscillators.delete(
          oscillator
        );

      },
      { once: true }
    );


    oscillator.start();


    oscillator.stop(
      now + duration
    );

  } catch (error) {

    // Audio must never break the game.

  }

}


function playStartSound() {

  playTone(
    520,
    0.08
  );

  playTone(
    780,
    0.12
  );

}


function playChoiceSound() {

  playTone(
    440,
    0.07
  );

}


function playSpinSound() {

  playTone(
    180,
    0.06,
    "square",
    0.35
  );

}


function playRevealSound() {

  playTone(
    620,
    0.08
  );

  playTone(
    900,
    0.12
  );

}


function playPointSound() {

  playTone(
    660,
    0.07
  );

  playTone(
    880,
    0.10
  );

  playTone(
    1100,
    0.13
  );

}


function playSafeSound() {

  playTone(
    420,
    0.09
  );

  playTone(
    520,
    0.11
  );

}


function playGameOverSound() {

  playTone(
    300,
    0.12
  );

  playTone(
    220,
    0.16
  );

  playTone(
    150,
    0.20
  );

}


// ==============================
// SLOT REEL STATE
// ==============================

let reelAnimation = null;
let isReelSpinning = false;


// ==============================
// HIGH SCORE
// ==============================

const HIGH_SCORE_KEY =
  "eyeRouletteHighScore";

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


// ==============================
// RETRO ROAST SYSTEM
// ==============================

const roastLines = {

  open: [
    "🤨 THAT WAS SUSPICIOUSLY CONFIDENT.",
    "OH, YOU'RE FEELING BRAVE.",
    "THAT ANSWER WAS WAY TOO FAST.",
    "YOUR HONOR, THEY CLICKED IT.",
    "CONFIDENCE: 100%.",
    "EVIDENCE: 0%.",
    "VERY INTERESTING.",
    "YOU REALLY WENT WITH THAT?",
    "THAT WAS BOLD.",
    "STRATEGY OR BUTTON MASHING?"
  ],

  closed: [
    "PLAYING IT SAFE, HUH?",
    "STRATEGIC BLINDNESS.",
    "COWARDICE OR GENIUS?",
    "NO EYE CONTACT. NO PROBLEMS.",
    "SAFE. BORING. EFFECTIVE.",
    "YOU SAW ABSOLUTELY NOTHING.",
    "THE EYES CAN'T JUDGE WHAT YOU DON'T SEE.",
    "A VERY CONVENIENT ANSWER.",
    "BRAVERY HAS LEFT THE CHAT.",
    "YOU CHOSE PEACE."
  ],

  spin: [
    "🎰 LET'S SEE IF YOU'RE TELLING THE TRUTH...",
    "THE MACHINE HAS QUESTIONS.",
    "THE CASINO DOES NOT TRUST YOU.",
    "THE ALGORITHM IS CONFUSED.",
    "THE MACHINE IS CONCERNED.",
    "SUSPICION LEVEL: 📈",
    "NO CAMERA. NO PROOF. JUST VIBES.",
    "THE HONOR SYSTEM IS HAVING A BAD DAY.",
    "ABSOLUTELY ZERO SCIENTIFIC EVIDENCE.",
    "THE EYES HAVE QUESTIONS."
  ],

  reveal: [
    "THE MOMENT OF TRUTH.",
    "NO TAKE-BACKS.",
    "FINAL ANSWER LOCKED.",
    "WE INVESTIGATED.",
    "THE MACHINE REMEMBERS NOTHING.",
    "HERE COMES THE VERDICT.",
    "YOUR SECRET IS SAFE WITH OUR NONEXISTENT CAMERA.",
    "INTERESTING CHOICE...",
    "WE'RE ABOUT TO FIND OUT.",
    "THE REEL HAS SPOKEN."
  ],

  survive: [
    "YOU GOT AWAY WITH IT.",
    "THE SYSTEM BLINKED FIRST.",
    "CASE CLOSED.",
    "WE FOUND NOTHING.",
    "YOU'RE GETTING AWAY WITH THIS.",
    "LUCK: SUSPICIOUSLY HIGH.",
    "THE MACHINE LOOKS CONFUSED.",
    "WE'RE NOT SAYING YOU'RE LYING...",
    "...BUT WE'RE ALSO NOT SAYING YOU'RE NOT.",
    "HONESTY HAS LEFT THE CHAT."
  ],

  point: [
    "CHEEKY. +1.",
    "THAT WAS EITHER GENIUS OR LUCK.",
    "ONE POINT FOR ABSURD CONFIDENCE.",
    "YOU ACTUALLY GOT AWAY WITH IT.",
    "THE EYES LOST THIS ROUND.",
    "+1. THE AUDACITY.",
    "POINT ACQUIRED. SUSPICION REMAINS.",
    "THAT SHOULD NOT HAVE WORKED.",
    "LUCKY LITTLE MENACE. +1.",
    "THE MACHINE IS NOT HAPPY ABOUT THAT."
  ],

  safe: [
    "SAFE. BORING. EFFECTIVE.",
    "ZERO POINTS. ZERO EYE CONTACT.",
    "TECHNICALLY, THAT COUNTS.",
    "WE SAW NOTHING. PROBABLY.",
    "A STRATEGIC NON-EVENT.",
    "YOU SURVIVED. CONGRATULATIONS.",
    "NO POINTS. NO PROBLEMS.",
    "THE HONOR SYSTEM APPROVES. SORT OF.",
    "THAT WAS VERY RESPONSIBLE OF YOU.",
    "NOTHING TO SEE HERE."
  ]

};


let lastRoastIndex = -1;


function getRandomMessage(messageList) {

  if (
    !Array.isArray(messageList) ||
    messageList.length === 0
  ) {

    return "";

  }


  const randomIndex =
    Math.floor(
      Math.random() *
      messageList.length
    );

  return messageList[randomIndex];

}


function getRandomRoast(category) {

  const roastList =
    roastLines[category];


  if (
    !roastList ||
    roastList.length === 0
  ) {

    return "";

  }


  if (
    roastList.length === 1
  ) {

    lastRoastIndex = 0;

    return roastList[0];

  }


  let randomIndex =
    Math.floor(
      Math.random() *
      roastList.length
    );


  while (
    randomIndex === lastRoastIndex
  ) {

    randomIndex =
      Math.floor(
        Math.random() *
        roastList.length
      );

  }


  lastRoastIndex =
    randomIndex;


  return roastList[randomIndex];

}


function showRoast(message) {

  if (!message) {
    return;
  }


  statusMessage.textContent =
    message;


  statusMessage.classList.remove(
    "roast-pop"
  );


  void statusMessage.offsetWidth;


  statusMessage.classList.add(
    "roast-pop"
  );

}


function pulseScoreDisplay() {

  currentScoreDisplay.classList.remove(
    "score-pulse"
  );


  void currentScoreDisplay.offsetWidth;


  currentScoreDisplay.classList.add(
    "score-pulse"
  );

}


// ==============================
// DOM ELEMENTS
// ==============================

const startScreen =
  document.getElementById(
    "start-screen"
  );

const startButton =
  document.getElementById(
    "start-button"
  );


const gameScreen =
  document.getElementById(
    "game-screen"
  );


const roundNumberDisplay =
  document.getElementById(
    "round-number"
  );

const currentScoreDisplay =
  document.getElementById(
    "current-score"
  );

const highScoreDisplay =
  document.getElementById(
    "high-score"
  );


const systemEyeVisual =
  document.getElementById(
    "system-eye-visual"
  );

const systemEyeState =
  document.getElementById(
    "system-eye-state"
  );


const systemSlotMachine =
  document.getElementById(
    "system-slot-machine"
  );

const slotStatus =
  document.getElementById(
    "slot-status"
  );


const choiceOpenButton =
  document.getElementById(
    "choice-open"
  );

const choiceClosedButton =
  document.getElementById(
    "choice-closed"
  );


const countdownArea =
  document.getElementById(
    "countdown-area"
  );

const countdownNumber =
  document.getElementById(
    "countdown-number"
  );


const revealArea =
  document.getElementById(
    "reveal-area"
  );

const revealSystemState =
  document.getElementById(
    "reveal-system-state"
  );

const revealSurvivalState =
  document.getElementById(
    "reveal-survival-state"
  );

const revealPointState =
  document.getElementById(
    "reveal-point-state"
  );

const revealCaughtState =
  document.getElementById(
    "reveal-caught-state"
  );


const resultStates =
  document.getElementById(
    "result-states"
  );

const resultSafe =
  document.getElementById(
    "result-safe"
  );

const resultPoint =
  document.getElementById(
    "result-point"
  );

const resultClosedSafe =
  document.getElementById(
    "result-closed-safe"
  );

const resultGameOver =
  document.getElementById(
    "result-game-over"
  );


const statusMessage =
  document.getElementById(
    "status-message"
  );


const gameOverScreen =
  document.getElementById(
    "game-over-screen"
  );

const gameOverHeading =
  document.getElementById(
    "game-over-heading"
  );

const gameOverMessage =
  document.getElementById(
    "game-over-message"
  );

const gameOverSubmessage =
  document.getElementById(
    "game-over-submessage"
  );


const finalScoreValue =
  document.getElementById(
    "final-score-value"
  );

const roundsSurvivedValue =
  document.getElementById(
    "rounds-survived-value"
  );

const finalHighScoreValue =
  document.getElementById(
    "final-high-score-value"
  );

const newHighScoreMessage =
  document.getElementById(
    "new-high-score-message"
  );


const restartButton =
  document.getElementById(
    "restart-button"
  );


// ==============================
// FULLSCREEN
// ==============================

const fullscreenButton =
  document.getElementById(
    "fullscreen-button"
  );


function updateFullscreenButton() {

  if (!fullscreenButton) {
    return;
  }


  if (
    document.fullscreenElement
  ) {

    fullscreenButton.textContent =
      "⛶ EXIT FULLSCREEN";

    fullscreenButton.setAttribute(
      "aria-label",
      "Exit fullscreen"
    );

    fullscreenButton.setAttribute(
      "title",
      "Exit fullscreen"
    );

  } else {

    fullscreenButton.textContent =
      "⛶ FULLSCREEN";

    fullscreenButton.setAttribute(
      "aria-label",
      "Enter fullscreen"
    );

    fullscreenButton.setAttribute(
      "title",
      "Enter fullscreen"
    );

  }

}


if (fullscreenButton) {

  fullscreenButton.addEventListener(
    "click",
    async () => {

      try {

        if (
          document.fullscreenElement
        ) {

          await document.exitFullscreen();

        } else if (
          document.documentElement
            .requestFullscreen
        ) {

          await document.documentElement
            .requestFullscreen();

        }

      } catch (error) {

        console.warn(
          "Fullscreen was not allowed.",
          error
        );

      }

    }
  );

}


document.addEventListener(
  "fullscreenchange",
  updateFullscreenButton
);


updateFullscreenButton();


// ==============================
// RESULT OVERLAY
// ==============================

function createResultOverlay() {

  if (resultOverlay) {
    return;
  }


  resultOverlay =
    document.createElement(
      "div"
    );


  resultOverlay.id =
    "result-overlay";


  resultOverlay.innerHTML = `
    <div id="result-overlay-text">
      <span id="result-overlay-main"></span>
      <span id="result-overlay-sub"></span>
    </div>
  `;


  resultOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;

    display: flex;
    align-items: center;
    justify-content: center;

    background: rgba(10, 6, 20, 0.96);

    opacity: 0;
    pointer-events: none;

    transition:
      opacity 0.12s steps(2, end);
  `;


  const text =
    resultOverlay.querySelector(
      "#result-overlay-text"
    );


  text.style.cssText = `
    padding: 30px;

    text-align: center;

    font-family:
      "Courier New",
      monospace;

    font-size:
      clamp(3rem, 10vw, 10rem);

    font-weight: 900;

    line-height: 0.9;

    letter-spacing: 6px;

    transform: scale(0.65);

    transition:
      transform 0.16s steps(2, end);
  `;


  const main =
    resultOverlay.querySelector(
      "#result-overlay-main"
    );


  main.style.cssText = `
    display: block;
  `;


  const sub =
    resultOverlay.querySelector(
      "#result-overlay-sub"
    );


  sub.style.cssText = `
    display: block;

    margin-top: 24px;

    font-size: 0.42em;

    letter-spacing: 8px;
  `;


  document.body.appendChild(
    resultOverlay
  );

}


function showResultOverlay(
  type,
  duration,
  onComplete = null
) {

  createResultOverlay();


  if (
    resultOverlayTimeout !== null
  ) {

    clearTimeout(
      resultOverlayTimeout
    );

    resultOverlayTimeout = null;

  }


  const main =
    resultOverlay.querySelector(
      "#result-overlay-main"
    );

  const sub =
    resultOverlay.querySelector(
      "#result-overlay-sub"
    );

  const text =
    resultOverlay.querySelector(
      "#result-overlay-text"
    );


  if (
    type === "eye-contact"
  ) {

    main.textContent =
      "EYE CONTACT";

    sub.textContent =
      "DETECTED";


    text.style.color =
      "#ff2bd6";

    text.style.textShadow =
      `
        6px 6px 0 #00f0ff,
        -4px -4px 0 #ff2bd6
      `;

    sub.style.color =
      "#00f0ff";

    sub.style.textShadow =
      "4px 4px 0 #ff2bd6";

  }


  if (
    type === "point"
  ) {

    main.textContent =
      "+1 POINT!";

    sub.textContent =
      "NICE MOVE";


    text.style.color =
      "#00f0ff";

    text.style.textShadow =
      `
        5px 5px 0 #ff2bd6,
        -3px -3px 0 #00f0ff
      `;

    sub.style.color =
      "#ff2bd6";

    sub.style.textShadow =
      "3px 3px 0 #00f0ff";

  }


  if (
    type === "safe"
  ) {

    main.textContent =
      "SAFE!";

    sub.textContent =
      "EYES CLOSED";


    text.style.color =
      "#00f0ff";

    text.style.textShadow =
      `
        5px 5px 0 #ff2bd6,
        -3px -3px 0 #00f0ff
      `;

    sub.style.color =
      "#ff2bd6";

    sub.style.textShadow =
      "3px 3px 0 #00f0ff";

  }


  resultOverlayVisible =
    true;


  resultOverlay.style.opacity =
    "1";

  resultOverlay.style.pointerEvents =
    "auto";


  text.style.transform =
    "scale(1)";


  resultOverlayTimeout =
    setTimeout(() => {

      resultOverlayTimeout = null;

      resultOverlayVisible =
        false;

      hideResultOverlay();


      if (
        typeof onComplete ===
        "function"
      ) {

        onComplete();

      }

    }, duration);

}


function hideResultOverlay() {

  if (!resultOverlay) {
    resultOverlayVisible =
      false;

    return;

  }


  resultOverlayVisible =
    false;


  resultOverlay.style.opacity =
    "0";

  resultOverlay.style.pointerEvents =
    "none";


  const text =
    resultOverlay.querySelector(
      "#result-overlay-text"
    );


  text.style.transform =
    "scale(0.65)";

}


// ==============================
// TIMER CLEANUP
// ==============================

function clearActiveTimers() {

  if (
    countdownInterval !== null
  ) {

    clearInterval(
      countdownInterval
    );

    countdownInterval = null;

  }


  if (
    reelAnimation !== null
  ) {

    clearTimeout(
      reelAnimation
    );

    reelAnimation = null;

  }


  if (
    resultOverlayTimeout !== null
  ) {

    clearTimeout(
      resultOverlayTimeout
    );

    resultOverlayTimeout = null;

  }


  isCountdownActive =
    false;

  isReelSpinning =
    false;

  resultOverlayVisible =
    false;


  hideResultOverlay();

}


// ==============================
// HIGH SCORE FUNCTIONS
// ==============================

function loadHighScore() {

  try {

    const savedHighScore =
      localStorage.getItem(
        HIGH_SCORE_KEY
      );


    if (
      savedHighScore === null
    ) {

      highScore = 0;

      return;

    }


    const parsedHighScore =
      Number(savedHighScore);


    if (
      Number.isFinite(parsedHighScore) &&
      parsedHighScore >= 0
    ) {

      highScore =
        Math.floor(parsedHighScore);

    } else {

      highScore = 0;

    }

  } catch (error) {

    highScore = 0;

  }

}


function saveHighScore() {

  try {

    localStorage.setItem(
      HIGH_SCORE_KEY,
      String(highScore)
    );

  } catch (error) {

    // Game continues normally.

  }

}


function updateHighScoreDisplay() {

  highScoreDisplay.textContent =
    highScore;

  finalHighScoreValue.textContent =
    highScore;

}


function checkForNewHighScore() {

  const previousHighScore =
    highScore;


  if (
    score > highScore
  ) {

    highScore = score;

    saveHighScore();

  }


  updateHighScoreDisplay();


  return score >
    previousHighScore;

}


// ==============================
// SLOT REEL
// ==============================

function prepareSlotReel() {

  systemEyeVisual.innerHTML = `

    <div class="slot-symbol">👀</div>
    <div class="slot-symbol">😑</div>

    <div class="slot-symbol">👀</div>
    <div class="slot-symbol">😑</div>

    <div class="slot-symbol">👀</div>
    <div class="slot-symbol">😑</div>

    <div class="slot-symbol">👀</div>
    <div class="slot-symbol">😑</div>

    <div class="slot-symbol">👀</div>
    <div class="slot-symbol">😑</div>

    <div class="slot-symbol">👀</div>
    <div class="slot-symbol">😑</div>

    <div class="slot-symbol">👀</div>
    <div class="slot-symbol">😑</div>

    <div class="slot-symbol">👀</div>
    <div class="slot-symbol">😑</div>

  `;


  systemEyeVisual.style.transition =
    "none";


  systemEyeVisual.style.transform =
    "translateY(0)";

}


function getTargetReelPosition() {

  const symbols =
    systemEyeVisual.querySelectorAll(
      ".slot-symbol"
    );


  const targetEmoji =
    systemChoice === "OPEN"
      ? "👀"
      : "😑";


  let targetIndex = -1;


  for (
    let i = symbols.length - 1;
    i >= 0;
    i--
  ) {

    if (
      symbols[i].textContent ===
      targetEmoji
    ) {

      targetIndex = i;

      break;

    }

  }


  if (
    targetIndex === -1
  ) {

    targetIndex = 0;

  }


  const firstSymbol =
    symbols[0];


  const symbolHeight =
    firstSymbol
      ? firstSymbol
          .getBoundingClientRect()
          .height
      : 150;


  const slotWindow =
    systemEyeVisual.parentElement;


  const windowHeight =
    slotWindow
      ? slotWindow
          .getBoundingClientRect()
          .height
      : symbolHeight;


  const centerOffset =
    (windowHeight - symbolHeight) /
    2;


  return (
    -(targetIndex * symbolHeight) +
    centerOffset
  );

}


function startSlotReelAnimation() {

  if (
    isReelSpinning ||
    systemChoice === null
  ) {

    return;

  }


  const thisRound =
    roundToken;


  isReelSpinning =
    true;


  playSpinSound();


  systemSlotMachine.classList.remove(
    "revealed"
  );

  systemSlotMachine.classList.add(
    "spinning"
  );


  slotStatus.textContent =
    "SPINNING...";


  showRoast(
    getRandomRoast("spin")
  );


  prepareSlotReel();


  void systemEyeVisual.offsetHeight;


  const finalPosition =
    getTargetReelPosition();


  systemEyeVisual.style.transition =
    "transform 2.65s cubic-bezier(0.12, 0.75, 0.18, 1)";


  systemEyeVisual.style.transform =
    `translateY(${finalPosition}px)`;


  reelAnimation =
    setTimeout(() => {

      if (
        thisRound !== roundToken
      ) {

        return;

      }


      finishSlotReelAnimation(
        thisRound
      );

    }, 2650);

}


function finishSlotReelAnimation(
  expectedRound = roundToken
) {

  if (
    expectedRound !== roundToken
  ) {

    return;

  }


  if (
    !isReelSpinning
  ) {

    return;

  }


  isReelSpinning =
    false;


  if (
    reelAnimation !== null
  ) {

    clearTimeout(
      reelAnimation
    );

    reelAnimation = null;

  }


  playRevealSound();


  systemSlotMachine.classList.remove(
    "spinning"
  );

  systemSlotMachine.classList.add(
    "revealed"
  );


  slotStatus.textContent =
    "REVEAL";


  /*
    systemChoice was already decided
    before the reel animation started.

    The reel only reveals it.
  */

  systemEyeState.textContent =
    systemChoice;


  const symbols =
    systemEyeVisual.querySelectorAll(
      ".slot-symbol"
    );


  const targetEmoji =
    systemChoice === "OPEN"
      ? "👀"
      : "😑";


  symbols.forEach((symbol) => {

    symbol.classList.remove(
      "selected-result"
    );

  });


  for (
    let i = symbols.length - 1;
    i >= 0;
    i--
  ) {

    if (
      symbols[i].textContent ===
      targetEmoji
    ) {

      symbols[i].classList.add(
        "selected-result"
      );

      break;

    }

  }

}


function resetSlotReel() {

  if (
    reelAnimation !== null
  ) {

    clearTimeout(
      reelAnimation
    );

    reelAnimation = null;

  }


  isReelSpinning =
    false;


  systemSlotMachine.classList.remove(
    "spinning"
  );

  systemSlotMachine.classList.remove(
    "revealed"
  );


  slotStatus.textContent =
    "READY";


  prepareSlotReel();

}


// ==============================
// START GAME
// ==============================

function startGame() {

  if (
    startScreen.hidden
  ) {

    return;

  }


  clearActiveTimers();

  stopAllAudio();


  initAudio();

  playStartSound();


  score = 0;

  roundNumber = 1;

  roundsSurvived = 0;


  playerChoice = null;

  systemChoice = null;


  resultProcessed =
    false;

  gameOver =
    false;

  continueKey =
    null;


  roundToken += 1;


  startScreen.hidden =
    true;

  gameScreen.hidden =
    false;

  gameOverScreen.hidden =
    true;


  newHighScoreMessage.hidden =
    true;


  updateHighScoreDisplay();


  startRound();


  showRoast(
    getRandomRoast("reveal")
  );

}


// ==============================
// START ROUND
// ==============================

function startRound() {

  /*
    A new round gets a new token.
    Any callback belonging to an older
    round is now invalid.
  */

  roundToken += 1;


  playerChoice = null;

  systemChoice = null;


  isCountdownActive =
    false;

  resultProcessed =
    false;

  continueKey =
    null;


  systemEyeState.textContent =
    "???";


  resetSlotReel();


  countdownArea.hidden =
    true;

  revealArea.hidden =
    true;

  resultStates.hidden =
    true;


  resultSafe.hidden =
    true;

  resultPoint.hidden =
    true;

  resultClosedSafe.hidden =
    true;

  resultGameOver.hidden =
    true;


  choiceOpenButton.disabled =
    false;

  choiceClosedButton.disabled =
    false;


  choiceOpenButton.classList.remove(
    "selected"
  );

  choiceClosedButton.classList.remove(
    "selected"
  );


  statusMessage.textContent =
    "";


  statusMessage.classList.remove(
    "roast-pop"
  );


  roundNumberDisplay.textContent =
    roundNumber;

  currentScoreDisplay.textContent =
    score;


  updateHighScoreDisplay();

}


// ==============================
// START NEXT ROUND
// ==============================

function startNextRound() {

  if (
    !resultProcessed ||
    gameOver ||
    (
      continueKey !== "ENTER" &&
      continueKey !== "SPACE"
    )
  ) {

    return;

  }


  /*
    Do not allow the player to skip
    the visible result overlay.
  */

  if (
    resultOverlayVisible
  ) {

    return;

  }


  hideResultOverlay();


  resultProcessed =
    false;

  continueKey =
    null;


  roundNumber += 1;


  /*
    The next round starts immediately
    after ENTER / SPACE is pressed.
  */

  startRound();


  showRoast(
    getRandomRoast("reveal")
  );

}


// ==============================
// PLAYER CHOICE
// ==============================

function selectPlayerChoice(choice) {

  if (
    playerChoice !== null ||
    isCountdownActive ||
    isReelSpinning ||
    gameOver ||
    resultOverlayVisible
  ) {

    return;

  }


  if (
    choice !== "OPEN" &&
    choice !== "CLOSED"
  ) {

    return;

  }


  playerChoice =
    choice;


  playChoiceSound();


  if (
    choice === "OPEN"
  ) {

    choiceOpenButton.classList.add(
      "selected"
    );

    showRoast(
      getRandomRoast("open")
    );

  }


  if (
    choice === "CLOSED"
  ) {

    choiceClosedButton.classList.add(
      "selected"
    );

    showRoast(
      getRandomRoast("closed")
    );

  }


  choiceOpenButton.disabled =
    true;

  choiceClosedButton.disabled =
    true;


  /*
    IMPORTANT:

    Decide the system result BEFORE
    the reel animation starts.
  */

  systemChoice =
    Math.random() < 0.5
      ? "OPEN"
      : "CLOSED";


  startCountdown();

}


// ==============================
// COUNTDOWN + SLOT SPIN
// ==============================

function startCountdown() {

  if (
    isCountdownActive ||
    isReelSpinning ||
    systemChoice === null
  ) {

    return;

  }


  const thisRound =
    roundToken;


  isCountdownActive =
    true;


  countdownArea.hidden =
    false;

  countdownNumber.textContent =
    "3";


  showRoast(
    getRandomRoast("spin")
  );


  startSlotReelAnimation();


  let countdownValue = 3;


  countdownInterval =
    setInterval(() => {

      /*
        Ignore an old countdown callback.
      */

      if (
        thisRound !== roundToken
      ) {

        clearInterval(
          countdownInterval
        );

        countdownInterval = null;

        return;

      }


      countdownValue -= 1;


      if (
        countdownValue > 0
      ) {

        countdownNumber.textContent =
          countdownValue;

        return;

      }


      clearInterval(
        countdownInterval
      );

      countdownInterval = null;


      countdownArea.hidden =
        true;

      isCountdownActive =
        false;


      /*
        At 3 seconds the reel should already
        have completed at 2.65 seconds.

        If it has not, finish it safely.
      */

      if (
        isReelSpinning
      ) {

        finishSlotReelAnimation(
          thisRound
        );

      }


      showRoast(
        getRandomRoast("reveal")
      );


      revealResult(
        thisRound
      );

    }, 1000);

}


// ==============================
// REVEAL RESULT
// ==============================

function revealResult(
  expectedRound = roundToken
) {

  if (
    expectedRound !== roundToken
  ) {

    return;

  }


  if (
    systemChoice === null ||
    playerChoice === null ||
    resultProcessed
  ) {

    return;

  }


  /*
    Normally the reel has already finished.
    This only safely finishes it if necessary.
  */

  if (
    isReelSpinning
  ) {

    finishSlotReelAnimation(
      expectedRound
    );

  }


  revealArea.hidden =
    false;


  systemEyeState.textContent =
    systemChoice;


  revealSystemState.textContent =
    `System chose: ${systemChoice}`;


  calculateResult(
    expectedRound
  );

}


// ==============================
// CALCULATE RESULT
// ==============================

function calculateResult(
  expectedRound = roundToken
) {

  if (
    expectedRound !== roundToken
  ) {

    return;

  }


  if (
    resultProcessed
  ) {

    return;

  }


  if (
    playerChoice === null ||
    systemChoice === null
  ) {

    return;

  }


  /*
    Lock result processing immediately.
    This prevents duplicate score changes,
    duplicate overlays, and duplicate game-over.
  */

  resultProcessed =
    true;


  resultStates.hidden =
    false;


  const funnyMessage =
    getRandomMessage(

      playerChoice === "OPEN" &&
      systemChoice === "CLOSED"

        ? messages.riskySafe

        : playerChoice === "CLOSED" &&
          systemChoice === "OPEN"

          ? messages.closedOpen

          : messages.bothClosed

    );


  // ==============================
  // OPEN + OPEN = GAME OVER
  // ==============================

  if (
    playerChoice === "OPEN" &&
    systemChoice === "OPEN"
  ) {

    revealSurvivalState.textContent =
      "You were caught making eye contact.";


    revealPointState.textContent =
      "Points this round: +0";


    revealCaughtState.textContent =
      "GAME OVER";


    resultGameOver.hidden =
      false;


    gameOver =
      true;


    continueKey =
      null;


    playGameOverSound();


    /*
      Only the game-over path waits.

      EYE CONTACT DETECTED stays for 2 seconds,
      then Game Over appears automatically.
    */

    showResultOverlay(
      "eye-contact",
      2000,
      () => {

        /*
          The callback is still associated with
          this exact round.
        */

        if (
          expectedRound !== roundToken
        ) {

          return;

        }


        showGameOver();

      }
    );


    return;

  }


  // ==============================
  // OPEN + CLOSED = SURVIVE +1
  // ==============================

  if (
    playerChoice === "OPEN" &&
    systemChoice === "CLOSED"
  ) {

    score += 1;


    roundsSurvived += 1;


    playPointSound();


    revealSurvivalState.textContent =
      "They blinked first. You survived.";


    revealPointState.textContent =
      "Points this round: +1";


    revealCaughtState.textContent =
      "";


    resultPoint.hidden =
      false;


    currentScoreDisplay.textContent =
      score;


    pulseScoreDisplay();


    continueKey =
      "ENTER";


    showRoast(
      `${getRandomRoast("point")} — ${funnyMessage}`
    );


    /*
      The overlay is visual only.
      ENTER becomes usable immediately
      AFTER this overlay disappears.
    */

    showResultOverlay(
      "point",
      1000
    );


    return;

  }


  // ==============================
  // CLOSED + OPEN = SURVIVE +0
  // ==============================

  if (
    playerChoice === "CLOSED" &&
    systemChoice === "OPEN"
  ) {

    roundsSurvived += 1;


    playSafeSound();


    revealSurvivalState.textContent =
      "You survived by keeping your eyes closed.";


    revealPointState.textContent =
      "Points this round: +0";


    revealCaughtState.textContent =
      "";


    resultClosedSafe.hidden =
      false;


    continueKey =
      "SPACE";


    showRoast(
      `${getRandomRoast("safe")} — ${funnyMessage}`
    );


    showResultOverlay(
      "safe",
      1000
    );


    return;

  }


  // ==============================
  // CLOSED + CLOSED = SURVIVE +0
  // ==============================

  if (
    playerChoice === "CLOSED" &&
    systemChoice === "CLOSED"
  ) {

    roundsSurvived += 1;


    playSafeSound();


    revealSurvivalState.textContent =
      "Nobody looked. You survived.";


    revealPointState.textContent =
      "Points this round: +0";


    revealCaughtState.textContent =
      "";


    resultClosedSafe.hidden =
      false;


    continueKey =
      "SPACE";


    showRoast(
      `${getRandomRoast("safe")} — ${funnyMessage}`
    );


    showResultOverlay(
      "safe",
      1000
    );

  }

}


// ==============================
// GAME OVER
// ==============================

function showGameOver() {

  if (
    !gameOver
  ) {

    return;

  }


  /*
    Prevent the same game-over transition
    from being processed twice.
  */

  if (
    !gameScreen.hidden &&
    !gameOverScreen.hidden
  ) {

    return;

  }


  hideResultOverlay();


  const isNewHighScore =
    checkForNewHighScore();


  gameScreen.hidden =
    true;

  gameOverScreen.hidden =
    false;


  gameOverHeading.textContent =
    "GAME OVER";


  gameOverMessage.textContent =
    "EYE CONTACT DETECTED";


  gameOverSubmessage.textContent =
    getRandomMessage(
      messages.gameOver
    );


  finalScoreValue.textContent =
    score;


  roundsSurvivedValue.textContent =
    roundsSurvived;


  finalHighScoreValue.textContent =
    highScore;


  newHighScoreMessage.hidden =
    !isNewHighScore;


  statusMessage.textContent =
    `GAME OVER. EYE CONTACT DETECTED. ${getRandomMessage(messages.gameOver)}`;

}


// ==============================
// RESTART GAME
// ==============================

function restartGame() {

  /*
    Invalidate every asynchronous callback
    belonging to the previous game.
  */

  roundToken += 1;


  clearActiveTimers();

  stopAllAudio();


  score = 0;

  roundNumber = 1;

  roundsSurvived = 0;


  playerChoice = null;

  systemChoice = null;


  resultProcessed =
    false;

  gameOver =
    false;

  continueKey =
    null;


  newHighScoreMessage.hidden =
    true;


  gameOverScreen.hidden =
    true;

  startScreen.hidden =
    false;

  gameScreen.hidden =
    true;


  resetSlotReel();


  updateHighScoreDisplay();

}


// ==============================
// BUTTON LISTENERS
// ==============================

startButton.addEventListener(
  "click",
  startGame
);


choiceOpenButton.addEventListener(
  "click",
  () => {

    selectPlayerChoice(
      "OPEN"
    );

  }
);


choiceClosedButton.addEventListener(
  "click",
  () => {

    selectPlayerChoice(
      "CLOSED"
    );

  }
);


restartButton.addEventListener(
  "click",
  restartGame
);


// ==============================
// KEYBOARD CONTROLS
// ==============================

document.addEventListener(
  "keydown",
  (event) => {

    /*
      Ignore browser key auto-repeat.
    */

    if (
      event.repeat
    ) {

      return;

    }


    // ==========================
    // ENTER
    // ==========================

    if (
      event.key === "Enter"
    ) {

      /*
        Let focused buttons handle
        their own native activation.
      */

      if (
        event.target instanceof HTMLElement &&
        event.target.closest("button")
      ) {

        return;

      }


      /*
        ENTER = start game.
      */

      if (
        !startScreen.hidden
      ) {

        event.preventDefault();

        startGame();

        return;

      }


      /*
        Game Over has no ENTER
        continuation.
      */

      if (
        gameOver
      ) {

        return;

      }


      /*
        ENTER does nothing during
        countdown/reel.
      */

      if (
        isCountdownActive ||
        isReelSpinning
      ) {

        return;

      }


      /*
        ENTER = OPEN.
      */

      if (
        playerChoice === null
      ) {

        event.preventDefault();

        selectPlayerChoice(
          "OPEN"
        );

        return;

      }


      /*
        ENTER = next round after
        OPEN + CLOSED.

        Overlay must already be gone.
      */

      if (
        resultProcessed &&
        continueKey === "ENTER" &&
        !resultOverlayVisible
      ) {

        event.preventDefault();

        startNextRound();

        return;

      }

    }


    // ==========================
    // SPACE
    // ==========================

    if (
      event.code === "Space"
    ) {

      /*
        Let focused buttons handle
        their own native activation.
      */

      if (
        event.target instanceof HTMLElement &&
        event.target.closest("button")
      ) {

        return;

      }


      /*
        Prevent browser page scrolling.
      */

      event.preventDefault();


      /*
        SPACE is ignored on start screen
        and Game Over screen.
      */

      if (
        !startScreen.hidden ||
        !gameOverScreen.hidden
      ) {

        return;

      }


      /*
        SPACE does nothing during
        countdown/reel.
      */

      if (
        isCountdownActive ||
        isReelSpinning
      ) {

        return;

      }


      /*
        SPACE = CLOSED.
      */

      if (
        playerChoice === null
      ) {

        selectPlayerChoice(
          "CLOSED"
        );

        return;

      }


      /*
        SPACE = next round after
        either CLOSED result.

        Overlay must already be gone.
      */

      if (
        resultProcessed &&
        continueKey === "SPACE" &&
        !resultOverlayVisible
      ) {

        startNextRound();

        return;

      }

    }


    // ==========================
    // R = RESTART
    // ==========================

    if (
      event.key.toLowerCase() === "r"
    ) {

      event.preventDefault();

      restartGame();

      return;

    }


    // ==========================
    // SHIFT
    // ==========================

    if (
      event.key === "Shift"
    ) {

      /*
        SHIFT remains unchanged.
        There is no defined game-ending
        behavior for it in the current UI.
      */

      return;

    }

  }
);


// ==============================
// INITIALIZE
// ==============================

loadHighScore();

updateHighScoreDisplay();

resetSlotReel();