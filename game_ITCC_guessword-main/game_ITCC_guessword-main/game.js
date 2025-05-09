const gameModeSelect = document.getElementById('gameMode');
const playerNamesDiv = document.getElementById('playerNames');
const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');
const startGameBtn = document.getElementById('startGame');
const wordInputArea = document.getElementById('wordInputArea');
const guessArea = document.getElementById('guessArea');
const wordInput = document.getElementById('wordInput');
const goBtn = document.getElementById('goBtn');
const inputTimerEl = document.getElementById('inputTimer');
const guessTimerEl = document.getElementById('guessTimer');
const gameArea = document.getElementById('gameArea');
const scoreBoard = document.getElementById('scoreBoard');
const status = document.getElementById('status');
const recordList = document.getElementById('recordList');
const maxPointsSelect = document.getElementById('maxPoints');
const letterPool = document.getElementById('letterPool');
const guessSlots = document.getElementById('guessSlots');
const submitDragGuess = document.getElementById('submitDragGuess');
const giveUpBtn = document.getElementById('giveUpBtn');
const skipGuess = document.getElementById('skipGuess');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');

const wordBank = ['banana', 'computer', 'javascript', 'holiday', 'mountain', 'science', 'engineer'];

let wordToGuess = '';
let player1 = '', player2 = '';
let currentGuesser = '';
let currentTyper = '';
let score = { p1: 0, p2: 0 };
let maxPoints = 3;
let inputTimer, guessTimer;
let gameMode = 1;

loadRecords();

gameModeSelect.addEventListener('change', () => {
  playerNamesDiv.style.display = gameModeSelect.value === '2' ? 'block' : 'none';
});

startGameBtn.addEventListener('click', () => {
  gameMode = parseInt(gameModeSelect.value);
  maxPoints = parseInt(maxPointsSelect.value);
  player1 = gameMode === 2 ? player1Input.value.trim() : 'Player';
  player2 = gameMode === 2 ? player2Input.value.trim() : 'Computer';

  if (gameMode === 2 && (!player1 || !player2)) {
    alert('Enter both player names.');
    return;
  }

  score = { p1: 0, p2: 0 };
  gameArea.style.display = 'block';
  document.getElementById('setup').style.display = 'none';
  nextRound();
});

function nextRound() {
  wordInputArea.style.display = 'none';
  guessArea.style.display = 'none';
  wordInput.value = '';
  status.innerText = '';

  if (gameMode === 1) {
    wordToGuess = wordBank[Math.floor(Math.random() * wordBank.length)];
    currentGuesser = player1;
    currentTyper = 'Computer';
    startGuessingPhase();
  } else {
    currentGuesser = currentGuesser === player1 ? player2 : player1;
    currentTyper = currentGuesser === player1 ? player2 : player1;
    status.innerText = `${currentTyper}, input a word for ${currentGuesser} to guess.`;
    startWordInputPhase();
  }
}

function startWordInputPhase() {
  wordInputArea.style.display = 'block';
  let timeLeft = 30;
  inputTimerEl.innerText = `Time left: ${timeLeft}s`;
  clearInterval(inputTimer);
  inputTimer = setInterval(() => {
    timeLeft--;
    inputTimerEl.innerText = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(inputTimer);
      alert("No word was entered. Please try again.");
    }
  }, 1000);
}

goBtn.addEventListener('click', () => {
  clearInterval(inputTimer);
  let input = wordInput.value.trim().slice(0, 45);
  if (input.length < 1) {
    alert("Please input a valid word.");
    return;
  }
  wordToGuess = input;
  startGuessingPhase();
});

function startGuessingPhase() {
  guessArea.style.display = 'block';
  wordInputArea.style.display = 'none';
  guessSlots.innerHTML = '';
  letterPool.innerHTML = '';

  let shuffled = shuffleArray(wordToGuess.toUpperCase().split(''));
  shuffled.forEach((letter, index) => {
    const span = document.createElement('span');
    span.textContent = letter;
    span.className = 'draggable-letter';
    span.draggable = true;
    span.id = `drag-${index}`;
    span.addEventListener('dragstart', dragStart);
    letterPool.appendChild(span);
  });

  for (let i = 0; i < wordToGuess.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'letter-slot';
    slot.dataset.index = i;
    slot.addEventListener('dragover', allowDrop);
    slot.addEventListener('drop', drop);
    guessSlots.appendChild(slot);
  }

  startGuessTimer();
}

submitDragGuess.addEventListener('click', () => {
  let guess = '';
  document.querySelectorAll('.letter-slot').forEach(slot => {
    guess += slot.textContent;
  });

  if (guess.toLowerCase() === wordToGuess.toLowerCase()) {
    clearInterval(guessTimer);
    correctSound.play();
    if (currentGuesser === player1) score.p1++;
    else score.p2++;
    status.innerText = `${currentGuesser} guessed correctly!`;
  } else {
    wrongSound.play();
    alert("Incorrect guess.");
    if (currentTyper === player1) score.p1++;
    else score.p2++;
  }

  updateScore();
  if (score.p1 >= maxPoints || score.p2 >= maxPoints) {
    endGame();
  } else {
    setTimeout(nextRound, 1500);
  }
});

skipGuess.addEventListener('click', () => {
  clearInterval(guessTimer);
  if (currentTyper === player1) score.p1++;
  else score.p2++;
  updateScore();
  status.innerText = `${currentGuesser} skipped. Point to ${currentTyper}.`;
  setTimeout(() => {
    if (score.p1 >= maxPoints || score.p2 >= maxPoints) endGame();
    else nextRound();
  }, 1500);
});

giveUpBtn.addEventListener('click', () => {
  
  console.log("Attaching give up event to:", giveUpBtn);
  clearInterval(guessTimer);
  if (confirm("Are you sure you want to give up? This will end the game.")) {
    status.innerText = `${currentGuesser} gave up. ${currentTyper} wins!`;
    if (currentTyper === player1) score.p1++;
    else score.p2++;
    updateScore();
    endGame();
  }
});

function startGuessTimer() {
  let timeLeft = 90;
  guessTimerEl.innerText = `Time left: ${timeLeft}s`;
  clearInterval(guessTimer);
  guessTimer = setInterval(() => {
    timeLeft--;
    guessTimerEl.innerText = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(guessTimer);
      skipGuess.click();
    }
  }, 1000);
}

function dragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
}

function allowDrop(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData("text");
  const draggedEl = document.getElementById(draggedId);
  if (e.target.classList.contains('letter-slot')) {
    if (e.target.firstChild) {
      letterPool.appendChild(e.target.firstChild); // return to pool
    }
    e.target.appendChild(draggedEl);
  }
}

function updateScore() {
  scoreBoard.innerText = `${player1}: ${score.p1} | ${player2}: ${score.p2}`;
}

function endGame() {
  status.innerText = `${score.p1 > score.p2 ? player1 : player2} wins!`;

  // Save to server
  fetch('save_game.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      player1,
      player2,
      score1: score.p1,
      score2: score.p2,
      winner: score.p1 > score.p2 ? player1 : player2
    })
  }).then(res => res.json()).then(() => loadRecords());

  location.reload();
}

function loadRecords() {
  fetch('get_records.php')
    .then(res => res.json())
    .then(data => {
      recordList.innerHTML = '';
      data.forEach(record => {
        const li = document.createElement('li');
        li.textContent = `${record.player1} vs ${record.player2} - Winner: ${record.winner} (${record.score1} - ${record.score2})`;
        recordList.appendChild(li);
      });
    });
}

function shuffleArray(arr) {
  let shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
