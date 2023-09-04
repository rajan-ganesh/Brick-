const GRID = document.querySelector(".grid");
const COLLISION_CHECK_FREQUENCY = 10;
const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 5;
const USER_HEIGHT = 10;
const BOARD_WIDTH = 560;
const BOARD_HEIGHT = 300;
const BALL_DIAMETER = 20;
const USER_START_POSITION = [230, 10];
const BALL_START_POSITION = [270, 40];
GRID.style.width = BOARD_WIDTH + "px";
GRID.style.height = BOARD_HEIGHT + "px";

//state variables
let ballSpeedMultiplier = 1;
let userSpeedMultiplier = 1;
let blockCount = 15;
let ballAnimationFrame;
let userAnimationFrame;
let isBallStopped = true;
let isUserMovingLeft = false;
let isUserMovingRight = false;
let userCurrentPosition = USER_START_POSITION;
let ballCurrentPosition = BALL_START_POSITION;

function setCachedLevel() {
  const cachedLevel = localStorage.getItem("cachedLevel");
  if (cachedLevel) {
    console.log("found cached level: ", cachedLevel);
    document.getElementById("level-slider").value = cachedLevel;
    document.getElementById("level").innerHTML = "Level: " + cachedLevel;
    ballSpeedMultiplier = 1 + cachedLevel / 5;
    userSpeedMultiplier = 1 + cachedLevel / 5;
  }
}
setCachedLevel();

function setLevel(value) {
  ballSpeedMultiplier = 1 + value / 5;
  userSpeedMultiplier = 1 + value / 5;
  document.getElementById("level").innerHTML = "Level: " + value;
  console.log("caching level: ", value);
  localStorage.setItem("cachedLevel", value);
  console.log("Ball Speed: ", ballSpeedMultiplier);
  console.log("User Speed: ", userSpeedMultiplier);
}

class Block {
  constructor(xAxis, yAxis) {
    this.bottomLeft = [xAxis, yAxis];
    this.bottomRight = [xAxis + BLOCK_WIDTH, yAxis];
    this.topLeft = [xAxis, yAxis + BLOCK_HEIGHT];
    this.topRight = [xAxis + BLOCK_WIDTH, yAxis + BLOCK_HEIGHT];
  }
}

const blocks = [
  new Block(10, 280),
  new Block(120, 280),
  new Block(230, 280),
  new Block(340, 280),
  new Block(450, 280),
  new Block(10, 270),
  new Block(120, 270),
  new Block(230, 270),
  new Block(340, 270),
  new Block(450, 270),
  new Block(10, 260),
  new Block(120, 260),
  new Block(230, 260),
  new Block(340, 260),
  new Block(450, 260),
];

function addBlocks() {
  blocks.forEach((blockObject) => {
    console.log("here");
    const block = document.createElement("div");
    block.classList.add("block");
    let bottomLeft = blockObject.bottomLeft;
    block.style.left = bottomLeft[0] + "px";
    block.style.bottom = bottomLeft[1] + "px";
    block.style.height = BLOCK_HEIGHT + "px";
    block.style.width = BLOCK_WIDTH + "px";
    GRID.appendChild(block);
  });
}
addBlocks();

//create user
function drawUser() {
  user.style.left = userCurrentPosition[0] + "px";
  user.style.bottom = userCurrentPosition[1] + "px";
}
const user = document.createElement("div");
user.classList.add("user");
drawUser();
GRID.appendChild(user);

//user movement logic
document.addEventListener("keydown", resolveKeypress);
function resolveKeypress(e) {
  if (isBallStopped) {
    startGame();
  }
  switch (e.key) {
    case "ArrowLeft":
      isUserMovingLeft = true;
      break;
    case "ArrowRight":
      isUserMovingRight = true;
      break;
  }
}
document.addEventListener("keyup", resolveKeyup);
function resolveKeyup(e) {
  switch (e.key) {
    case "ArrowLeft":
      isUserMovingLeft = false;
      break;
    case "ArrowRight":
      isUserMovingRight = false;
      break;
  }
}
function startGame() {
  document.querySelector(".slider-container").innerHTML = null;
  document.getElementById("start-instruction").innerHTML = null;
  setInitialBallSpeed();
  moveBall();
  isBallStopped = false;
}

function moveUser() {
  if (isUserMovingLeft) {
    if (userCurrentPosition[0] > 0) {
      userCurrentPosition[0] -= 2 * userSpeedMultiplier;
      drawUser();
    }
  }
  if (isUserMovingRight) {
    if (userCurrentPosition[0] < BOARD_WIDTH - BLOCK_WIDTH) {
      userCurrentPosition[0] += 2 * userSpeedMultiplier;
      user.style.left = userCurrentPosition[0] + "px";
      drawUser();
    }
  }
  requestAnimationFrame(moveUser);
}
moveUser();

//create ball
const ball = document.createElement("div");
ball.classList.add("ball");
GRID.appendChild(ball);
drawBall();

function drawBall() {
  ball.style.left = ballCurrentPosition[0] + "px";
  ball.style.bottom = ballCurrentPosition[1] + "px";
}

//ball movement logic
let xDirection;
let yDirection;
function setInitialBallSpeed() {
  let randomizeBallStartDirection = Math.floor(Math.random() - 0.5);
  xDirection = +1 * ballSpeedMultiplier;
  yDirection = +1 * ballSpeedMultiplier;
  if (randomizeBallStartDirection === -1) {
    xDirection = -1 * ballSpeedMultiplier;
  }
}

function moveBall() {
  ballCurrentPosition[0] += xDirection;
  ballCurrentPosition[1] += yDirection;
  drawBall();
  ballAnimationFrame = requestAnimationFrame(moveBall);
}

function changeBallDirection(direction) {
  if (direction === "x") {
    xDirection = xDirection * -1;
  } else if (direction === "y") {
    yDirection = yDirection * -1;
  }
}

function checkForCollision() {
  //side wall collision
  if (ballCurrentPosition[0] >= BOARD_WIDTH - BALL_DIAMETER) {
    //position reset to prevent ball getting stuck in walls
    ballCurrentPosition[0] = BOARD_WIDTH - BALL_DIAMETER;
    changeBallDirection("x");
  } else if (ballCurrentPosition[0] <= 0) {
    ballCurrentPosition[0] = 0;
    changeBallDirection("x");
  } else if (ballCurrentPosition[1] >= BOARD_HEIGHT - BALL_DIAMETER) {
    ballCurrentPosition[1] = BOARD_HEIGHT - BALL_DIAMETER;
    changeBallDirection("y");
  } else if (ballCurrentPosition[1] <= 0) {
    endSequence("lose");
  }

  //user collision
  if (
    ballCurrentPosition[0] + 0.5 * BALL_DIAMETER >= userCurrentPosition[0] &&
    ballCurrentPosition[0] - 0.5 * BALL_DIAMETER <=
      userCurrentPosition[0] + BLOCK_WIDTH &&
    ballCurrentPosition[1] <= userCurrentPosition[1] + USER_HEIGHT
  ) {
    ballCurrentPosition[1] = userCurrentPosition[1] + USER_HEIGHT;
    changeBallDirection("y");
  }

  //block collision
  blocks.forEach((block, index) => {
    if (
      ballCurrentPosition[0] >= block.bottomLeft[0] &&
      ballCurrentPosition[0] <= block.bottomRight[0] &&
      ballCurrentPosition[1] + BALL_DIAMETER >= block.bottomLeft[1]
    ) {
      blockCount--;
      ballCurrentPosition[1] = block.bottomLeft[1] - BALL_DIAMETER;
      changeBallDirection("y");
      blocks.splice(index, 1);
      const allBlocks = Array.from(document.querySelectorAll(".block"));
      allBlocks[index].classList.remove("block");
      if (blockCount === 0) {
        endSequence("win");
      }
    }
  });
}

var collisionInterval = setInterval(
  checkForCollision,
  COLLISION_CHECK_FREQUENCY
);

function endSequence(result) {
  const messageDisplay = document.getElementById("message");
  const playAgainButton = document.getElementById("reset");

  if (result === "win") {
    messageDisplay.style.fontFamily = "happy_font";
    messageDisplay.style.fontSize = "50px";
    messageDisplay.innerHTML = "You Win !";
    messageDisplay.style.color = "#ff48a5";

    playAgainButton.style.backgroundColor = "#ffaed7";
    playAgainButton.style.fontFamily = "happy_font";
  } else if (result == "lose") {
    messageDisplay.innerHTML = "Game Over";
  }
  cancelAnimationFrame(ballAnimationFrame);
  clearInterval(collisionInterval);
  document.removeEventListener("keydown", resolveKeypress);
  document.removeEventListener("keyup", resolveKeyup);
  isUserMovingLeft = false;
  isUserMovingRight = false;

  document.addEventListener("keydown", (e) => {
    location.reload();
  });
  playAgainButton.disabled = false;
  playAgainButton.hidden = false;

  playAgainButton.addEventListener("click", () => {
    location.reload();
  });
}
