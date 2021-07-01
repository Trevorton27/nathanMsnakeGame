window.onload = () => {
  initializeGame();
  if (localStorage.length > 0)
    score.highScore = parseInt(localStorage.getItem('highScore')) || '0';
  //updateScore();
};

document.addEventListener('keydown', whichKeyisPressed);

document.addEventListener('click', (e) => {
  if (e.target.id === 'applySettingsButton') applyGameSettings();
  if (e.target.id === 'clearHighScoreButton') {
    score.highScore = 0;
    localStorage.setItem('highScore', score.highScore);
    displayScore();
  }
});

const gameSettings = {
  canvasWidth: 600,
  canvasHeight: 500,
  refreshRate: 125,
  isGameRunning: 0,
  snakeSize: 15,
  appleBaseSize: 30,
  isOneSecond: 0
};

const snake = {
  speedInX: 0,
  speedInY: 0,
  body: [
    { x: 400, y: 250 },
    { x: 400, y: 240 },
    { x: 400, y: 230 },
    { x: 400, y: 220 },
    { x: 400, y: 210 }
  ]
  // positionX: [400, 400, 400, 400, 400],
  // positionY: [250, 240, 230, 220, 210]
};

const apple = {
  positionX: 0,
  positionY: 0,
  size: 10,
  color: 'red'
};

const score = {
  numberApplesEaten: 0,
  multiplier: 1,
  gameScore: 0,
  highScore: 0,
  timer: 10
};

function initializeGame() {
  // snake.body.x.splice(4);
  // snake.body.y.splice(4);
  // for (i = 0; i < 5; i++) {
  //   snake.body.x[i] = gameSettings.canvasWidth / 2;
  //   snake.body.y[i] = gameSettings.canvasHeight / 2;
  // }

  snake.body.forEach((part) => {
    drawOnCanvas(
      part.x,
      part.y,
      gameSettings.snakeSize,
      gameSettings.snakeSize,
      'olive'
    );
  });

  document.querySelector('#gameCanvas').width = gameSettings.canvasWidth;
  document.querySelector('#gameCanvas').height = gameSettings.canvasHeight;
  drawOnCanvas(
    0,
    0,
    gameSettings.canvasWidth,
    gameSettings.canvasHeight,
    'black'
  );

  writeOnCanvas(
    gameSettings.canvasWidth / 2 - 125,
    gameSettings.canvasHeight / 2,

    'Press Space to Start!',
    'white'
  );

  placeApple();
}

function whichKeyisPressed(e) {
  const keyPressed = e.key;

  if (keyPressed === ' ') toggleGamePause();
  if (gameSettings.isGameRunning > 0) {
    if (keyPressed === 'ArrowUp' || keyPressed === 'w') turnSnakeUp();
    if (keyPressed === 'ArrowDown' || keyPressed === 's') turnSnakeDown();
    if (keyPressed === 'ArrowLeft' || keyPressed === 'a') turnSnakeLeft();
    if (keyPressed === 'ArrowRight' || keyPressed === 'd') turnSnakeRight();
  }
}

function toggleGamePause() {
  if (gameSettings.isGameRunning) {
    clearInterval(gameSettings.isGameRunning);
    gameSettings.isGameRunning = 0;
  } else {
    runGame();
  }
}

function runGame() {
  gameSettings.isGameRunning = setInterval(() => {
    if (gameSettings.isOneSecond === 1000) {
      gameSettings.isOneSecond = 0;
      updateMultiplierTimer();
    } else {
      gameSettings.isOneSecond += gameSettings.refreshRate;
    }
    drawEverythingElse();
    drawSnake();
    didSnakeCollideWithSelf();
    isSnakeInbounds();
    didEatApple();
  }, gameSettings.refreshRate);
}

//Was torn between making a turnSnake(keyPressed) function or leave it as it
//is shown.  I felt this maximized readability but am anxious to see
//your opinion.
function turnSnakeDown() {
  if (snake.speedInY === 0) {
    snake.speedInX = 0;
    snake.speedInY = gameSettings.snakeSize;
  }
}

function turnSnakeUp() {
  if (snake.speedInY === 0) {
    snake.speedInX = 0;
    snake.speedInY = -gameSettings.snakeSize;
  }
}

function turnSnakeLeft() {
  if (snake.speedInX === 0) {
    snake.speedInY = 0;
    snake.speedInX = -gameSettings.snakeSize;
  }
}

function turnSnakeRight() {
  if (snake.speedInX === 0) {
    snake.speedInY = 0;
    snake.speedInX = gameSettings.snakeSize;
  }
}

function drawEverythingElse() {
  document.querySelector('#gameCanvas').width = gameSettings.canvasWidth;
  document.querySelector('#gameCanvas').height = gameSettings.canvasHeight;

  drawOnCanvas(
    0,
    0,
    gameSettings.canvasWidth,
    gameSettings.canvasHeight,
    'black'
  );

  drawOnCanvas(apple.positionX, apple.positionY, apple.size, apple.size, 'red');
}

function drawSnake() {
  // addNewSnakePart();

  for (i = 0; i < snake.body.length; i++) {
    drawOnCanvas(
      snake.body.x,
      snake.body.y,
      gameSettings.snakeSize,
      gameSettings.snakeSize,
      'olive'
    );
  }
}

// function addNewSnakePart() {
//   snake.body.x;
//   snake.body.y;
//   snake.body.x.unshift(snake.body.x[0] + snake.speedInX);
//   snake.body.y.unshift(snake.body.y[0] + snake.speedInY);
// }

function didSnakeCollideWithSelf() {
  for (i = 2; i < snake.body.length; i++)
    if (
      doesCollide(
        snake.body.x,
        snake.body.y,
        gameSettings.snakeSize,
        snake.body.x,
        snake.body.y,
        gameSettings.snakeSize
      )
    )
      resetGame();
}

function isSnakeInbounds() {
  if (
    snake.body.x <= 0 ||
    snake.body.x > gameSettings.canvasWidth - gameSettings.snakeSize
  )
    resetGame();
  if (
    snake.body.y <= 0 ||
    snake.body.y > gameSettings.canvasHeight - gameSettings.snakeSize
  )
    resetGame();
}

function didEatApple() {
  if (
    doesCollide(
      apple.positionX,
      apple.positionY,
      apple.size,
      snake.positionX,
      snake.body.y,
      gameSettings.snakeSize
    )
  ) {
    score.numberApplesEaten++;
    score.multiplier++;
    updateScore();
    placeApple();
    growSnake();
    score.timer = 10;
  }
}

function resetGame() {
  snake.speedInX = 0;
  snake.speedInY = gameSettings.snakeSize;
  toggleGamePause();
  initializeGame();
  score.numberApplesEaten = 0;
  score.gameScore = 0;
  score.multiplier = 1;
  score.timer = 10;
  updateMultiplierTimer();
  displayScore();
}

function doesCollide(obj1X, obj1Y, obj1Size, obj2X, obj2Y, obj2Size) {
  if (
    obj1X < obj2X + obj2Size &&
    obj1X + obj1Size > obj2X &&
    obj1Y < obj2Y + obj2Size &&
    obj1Y + obj1Size > obj2Y
  )
    return true;
}

function growSnake() {
  snake.body.x.push(snake.body.x[0]);
  snake.body.y.push(snake.body.y[0]);
}

function placeApple() {
  apple.size = Math.floor(Math.random() * gameSettings.appleBaseSize + 5);

  //wanted to wrap the two expressions below in a do..while(doesCollide) but
  //couldn't figure out how to iterate through snake array in the while expression
  apple.positionX = Math.floor(
    Math.random() * (gameSettings.canvasWidth - apple.size)
  );
  apple.positionY = Math.floor(
    Math.random() * (gameSettings.canvasHeight - apple.size)
  );

  for (i = 0; i < snake.body.length; i++)
    if (
      doesCollide(
        apple.positionX,
        apple.positionY,
        apple.size,
        snake.body.x,
        snake.body.y,
        gameSettings.snakeSize
      )
    )
      placeApple();
}

function updateMultiplierTimer() {
  const displayMutliplierTimer = document.querySelector('#countDownCounterDiv');

  if (gameSettings.isGameRunning) {
    if (score.timer) {
      score.timer--;
      displayMutliplierTimer.innerHTML = `:${score.timer}`;
    } else {
      displayMutliplierTimer.innerHTML = ':--';
      score.multiplier = 1;
      displayScore();
    }
  } else {
    displayMutliplierTimer.innerHTML = `:${score.timer}`;
  }
}

function updateScore() {
  let snakeSpeed = Math.abs(snake.speedInX);
  if (snake.speedInY) snakeSpeed = Math.abs(snake.speedInY);

  score.gameScore += Math.floor(
    score.multiplier * 10
    // score.multiplier *
    // (1 / apple.size) *
    // (1 / gameSettings.canvasWidth) *
    // snakeSpeed
  );

  if (score.gameScore > score.highScore) {
    score.highScore = score.gameScore;
    localStorage.setItem('highScore', score.highScore);
  }

  displayScore();
}

console.log('highScore: ', score.highScore);

function displayScore() {
  const displayApplesEaten = document.querySelector('#applesEatenSpan');
  displayApplesEaten.innerHTML = `${score.numberApplesEaten}`;

  const displayMutliplier = document.querySelector('#multiplierSpan');
  displayMutliplier.innerHTML = `${score.multiplier}`;

  const displayGameScore = document.querySelector('#currentScoreDiv');
  displayGameScore.innerHTML = `${
    score.numberApplesEaten === 0 ? '0' : score.gameScore
  }`;

  const displayHighScore = document.querySelector('#highScoreDiv');
  displayHighScore.innerHTML = `${score.highScore}`;
}

function drawOnCanvas(startCordinate, endCordinate, width, height, color) {
  const canvas = document.querySelector('#gameCanvas');
  const canvasContext = canvas.getContext('2d');

  canvasContext.fillStyle = color;
  canvasContext.fillRect(startCordinate, endCordinate, width, height);
}

function writeOnCanvas(startCordinate, endCordinate, text, color) {
  const canvas = document.querySelector('#gameCanvas');
  const canvasContext = canvas.getContext('2d');

  canvasContext.font = '30px VT323';
  canvasContext.fillStyle = color;
  canvasContext.fillText(text, startCordinate, endCordinate);
}

function applyGameSettings() {
  const canvasSizeSelected = document.getElementsByName('canvasSize');
  let canvasSize = '';
  for (let i = 0; i < canvasSizeSelected.length; i++) {
    if (canvasSizeSelected[i].checked) canvasSize = canvasSizeSelected[i].value;
  }
  if (canvasSize === 'small') {
    gameSettings.canvasWidth = 300;
    gameSettings.canvasHeight = 300;
  } else if (canvasSize === 'medium') {
    gameSettings.canvasWidth = 500;
    gameSettings.canvasHeight = 400;
  } else if (canvasSize === 'large') {
    gameSettings.canvasWidth = 600;
    gameSettings.canvasHeight = 500;
  }

  const userDesiredSnakeSpeed = document.getElementsByName('snakeSpeed');
  for (let i = 0; i < userDesiredSnakeSpeed.length; i++) {
    if (userDesiredSnakeSpeed[i].checked)
      gameSettings.refreshRate = parseInt(userDesiredSnakeSpeed[i].value);
  }

  const appleSizeSelected = document.getElementsByName('appleSize');
  for (let i = 0; i < appleSizeSelected.length; i++) {
    if (appleSizeSelected[i].checked) apple.size = appleSizeSelected[i].value;
  }

  const snakeSizeSelected = document.getElementsByName('snakeSize');
  for (let i = 0; i < snakeSizeSelected.length; i++) {
    if (snakeSizeSelected[i].checked)
      gameSettings.snakeSize = parseInt(snakeSizeSelected[i].value);
  }

  initializeGame();
}

// Get the modal
const modal = document.getElementById('myModal');

// Get the button that opens the modal
const btn = document.getElementById('myBtn');

// Get the <span> element that closes the modal
const span = document.getElementsByClassName('close')[0];

// When the user clicks the button, open the modal
btn.addEventListener('click', function () {
  modal.style.display = 'block';
});
// When the user clicks on <span> (x), close the modal
span.addEventListener('click', function () {
  modal.style.display = 'none';
});

// When the user clicks anywhere outside of the modal, close it
window.addEventListener('click', function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
});
