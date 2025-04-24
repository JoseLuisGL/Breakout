let ball;
let paddle;
let bricks = [];
let cols = 5;
let rows = 1;
let brickWidth;
let brickHeight = 20;
let lives = 3;
let score = 0;
let gameOver = false;
let level = 1;
let maxLevel = 3;
let levelTransition = false;
let transitionTimer = 0;

function setup() {
  createCanvas(600, 600);
  ball = new Ball();
  paddle = new Paddle();
  brickWidth = width / cols;
  startLevel(level);
}

function draw() {
  background(30);

  if (gameOver) {
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    textSize(32);
    text("Game Over", width / 2, height / 2);
    noLoop();
    return;
  }

  if (levelTransition) {
    drawTransition();
    return;
  }

  ball.update();
  ball.show();
  ball.checkEdges();
  ball.checkPaddle(paddle);

  paddle.update();
  paddle.show();

  for (let i = bricks.length - 1; i >= 0; i--) {
    bricks[i].show();
    if (ball.hits(bricks[i])) {
      if (!bricks[i].unbreakable) {
        bricks[i].strength--;
        if (bricks[i].strength <= 0) {
          bricks.splice(i, 1);
          score += 1;
        }
      }
      ball.dy *= -1;
    }
  }

  // Mostrar vidas y puntos
  fill(255);
  textSize(16);
  text("Vidas: " + lives, 10, height - 10);
  text("Puntos: " + score, width - 100, height - 10);

  // Si la pelota cae
  if (ball.y > height) {
    lives--;
    if (lives <= 0) {
      gameOver = true;
    } else {
      ball.reset();
    }
  }

  // Cambiar de nivel
  if (bricks.every(b => b.unbreakable || b.strength <= 0) && !levelTransition) {
    if (level < maxLevel) {
      level++;
      levelTransition = true;
      transitionTimer = millis();
    } else {
      showWinMessage();
      noLoop();
    }
  }
}

function drawTransition() {
  let elapsed = millis() - transitionTimer;
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Nivel " + level, width / 2, height / 2);

  if (elapsed > 1500) {
    startLevel(level);
    levelTransition = false;
  }
}

function showWinMessage() {
  background(0, 150, 0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("¡Ganaste el juego!", width / 2, height / 2);
}

function startLevel(n) {
  bricks = [];
  rows = 3 + n;
  brickWidth = width / cols;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let isSpecial = false;
      let strength = 1;
      let unbreakable = false;

      if (n === 2 && !isSpecial) {
        // 1 bloque con fuerza 3
        if (r === 0 && c === 2) {
          strength = 3;
          isSpecial = true;
        }
      }

      if (n === 3) {
        // 2 bloques con fuerza 3
        if ((r === 0 && c === 1) || (r === 0 && c === 3)) {
          strength = 3;
          isSpecial = true;
        }

        // 1 bloque irrompible
        if (r === 1 && c === 2) {
          unbreakable = true;
          isSpecial = true;
        }
      }

      bricks.push(new Brick(c * brickWidth, r * brickHeight, strength, unbreakable));
    }
  }

  // Aumentar velocidad según el nivel
  ball.reset(n);
  paddle.x = width / 2 - paddle.w / 2;
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    paddle.move(-1);
  } else if (keyCode === RIGHT_ARROW) {
    paddle.move(1);
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    paddle.move(0);
  }
}

// --- Clases ---

class Ball {
  constructor() {
    this.r = 10;
    this.baseSpeed = 4;
    this.reset(1);
  }

  reset(lvl = 1) {
    this.x = width / 2;
    this.y = height / 2;
    let speed = this.baseSpeed + (lvl - 1); // aumenta por nivel
    this.dx = speed * (random() < 0.5 ? -1 : 1);
    this.dy = -speed;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
  }

  checkEdges() {
    if (this.x < this.r || this.x > width - this.r) {
      this.dx *= -1;
    }
    if (this.y < this.r) {
      this.dy *= -1;
    }
  }

  checkPaddle(paddle) {
    if (
      this.y + this.r > paddle.y &&
      this.x > paddle.x &&
      this.x < paddle.x + paddle.w
    ) {
      this.dy *= -1;
      this.y = paddle.y - this.r;
    }
  }

  hits(brick) {
    return (
      this.x > brick.x &&
      this.x < brick.x + brick.w &&
      this.y - this.r < brick.y + brick.h &&
      this.y + this.r > brick.y
    );
  }
}

class Paddle {
  constructor() {
    this.w = 80;
    this.h = 10;
    this.x = width / 2 - this.w / 2;
    this.y = height - 30;
    this.speed = 7;
    this.direction = 0;
  }

  update() {
    this.x += this.direction * this.speed;
    this.x = constrain(this.x, 0, width - this.w);
  }

  move(dir) {
    this.direction = dir;
  }

  show() {
    fill(0, 150, 255);
    rect(this.x, this.y, this.w, this.h);
  }
}

class Brick {
  constructor(x, y, strength = 1, unbreakable = false) {
    this.x = x;
    this.y = y;
    this.w = brickWidth;
    this.h = brickHeight;
    this.strength = strength;
    this.unbreakable = unbreakable;
  }

  show() {
    if (this.unbreakable) {
      fill(100); // gris
    } else if (this.strength === 3) {
      fill(255, 0, 0); // rojo fuerte
    } else if (this.strength === 2) {
      fill(255, 150, 0); // naranja
    } else {
      fill(255, 200, 0); // amarillo claro
    }
    rect(this.x, this.y, this.w, this.h);
  }
}
