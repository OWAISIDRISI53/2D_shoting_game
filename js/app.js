// Importing All Music from sounds.js

import {
  introMusic,
  shootingSound,
  killEnemySound,
  gameOverSound,
  heavyWeaponSound,
  hugeWeaponSound,
} from "./sounds.js";

introMusic.play();

// Basic Environment Setup
let canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

const context = canvas.getContext("2d");
const lightWeaponDamage = 10;
const heavyWeaponDamage = 20;
const hugeWeaponDamage = 50;

let difficulty = 2;
let form = document.querySelector("form");
let scoreBoard = document.querySelector(".scoreBoard");
let btn = document.querySelector(".btn");
let playerScore = 0;

// basic functions

btn.addEventListener("click", (e) => {
  e.preventDefault();
  introMusic.pause();
  form.style.display = "none";
  scoreBoard.style.display = "block";
  const userValue = document.getElementById("difficulty").value;
  switch (userValue) {
    case "Easy":
      setInterval(spawnEnemy, 2000);
      difficulty = 5;
      break;

    case "Medium":
      setInterval(spawnEnemy, 1400);
      difficulty = 8;
      break;

    case "Hard":
      setInterval(spawnEnemy, 1000);
      difficulty = 10;
      break;

    case "Insane":
      setInterval(spawnEnemy, 700);
      difficulty = 12;
      break;

    default:
      break;
  }
});

const gameOverLoader = () => {
  const gameOverBanner = document.createElement("div");
  const gameOverBtn = document.createElement("btn");
  const highScore = document.createElement("div");

  highScore.innerText = `High Score ${
    localStorage.getItem("highScore")
      ? localStorage.getItem("highScore")
      : playerScore
  }`;

  const oldHighScore =
    localStorage.getItem("highScore") && localStorage.getItem("highScore");

  if (oldHighScore < playerScore) {
    localStorage.setItem("highScore", playerScore);
    highScore.innerHTML = `High Score : ${playerPosition}`;
  }

  gameOverBtn.innerText = "Play Again";
  gameOverBanner.appendChild(highScore);
  gameOverBanner.appendChild(gameOverBtn);

  gameOverBtn.addEventListener("click", (e) => location.reload());
  gameOverBanner.classList.add("gameover");
  gameOverBtn.classList.add("btn");
  document.body.appendChild(gameOverBanner);
};

// ===============  Crating Player , Weapon, Enemy class     ===============

const playerPosition = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};
import { Player, Enemy, Weapon, HugeWeapon, Particle } from "./classes.js";

// ----------   Main Logic Start  -- ---------

// ----------
const owais = new Player(playerPosition.x, playerPosition.y, 15, "white");

const weapons = [];
const hugeWeapons = [];
const enemies = [];
const particles = [];

// function for enemy spawn
const spawnEnemy = () => {
  const enemySize = Math.random() * (40 - 5) + 5;

  const enemyColor = `hsl(${Math.floor(Math.random() * 360)},100%,50%)`;

  let random;

  if (Math.random() < 0.5) {
    random = {
      x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize,
      y: Math.random() * canvas.height,
    };
  } else {
    random = {
      x: Math.random() * canvas.width,
      y: Math.random() < 0.5 ? canvas.height + enemySize : 0 - enemySize,
    };
  }
  const myAngle = Math.atan2(
    canvas.height / 2 - random.y,
    canvas.width / 2 - random.x
  );
  const velocity = {
    x: Math.cos(myAngle) * difficulty,
    y: Math.sin(myAngle) * difficulty,
  };

  enemies.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity));
};

// ---=-=-=-=-=-==-== Animation function
function animation() {
  let animationId;
  animationId = requestAnimationFrame(animation);

  context.fillStyle = "rgba(49,49,49,0.2)";

  context.fillRect(0, 0, canvas.width, canvas.height);

  owais.draw();

  // Genereting Particles
  particles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1);
    }
    particle.update();
  });

  // Genereting HUGE WEAPON
  hugeWeapons.forEach((hugeWeapon, hugeWeaponIndex) => {
    if (hugeWeapon.x > canvas.width) {
      hugeWeapons.splice(hugeWeaponIndex, 1);
    } else {
      hugeWeapon.update();
    }
  });

  weapons.forEach((weapon, weaponIndex) => {
    weapon.update();
    if (
      weapon.x + weapon.radius < 1 ||
      weapon.y + weapon.radius < 1 ||
      weapon.x - weapon.radius > canvas.width ||
      weapon.y - weapon.radius > canvas.height
    ) {
      weapons.splice(weaponIndex, 1);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    const distanceBetweenPlayerAndEnemy = Math.hypot(
      owais.x - enemy.x,
      owais.y - enemy.y
    );

    if (distanceBetweenPlayerAndEnemy - owais.radius - enemy.radius < 1) {
      cancelAnimationFrame(animationId);
      // location.reload();
      gameOverSound.play();
      hugeWeaponSound.pause();
      shootingSound.pause();
      heavyWeaponSound.pause();
      killEnemySound.pause();
      return gameOverLoader();
    }
    hugeWeapons.forEach((hugeWeapon) => {
      const distanceBetweenHugeAndEnemy = hugeWeapon.x - enemy.x;
      if (
        distanceBetweenHugeAndEnemy <= 200 &&
        distanceBetweenHugeAndEnemy >= -200
      ) {
        playerScore += 10;
        setTimeout(() => {
          killEnemySound.play();
          enemies.splice(enemyIndex, 1);
        });
      }
    });
    weapons.forEach((weapon, weaponIndex) => {
      const distanceBetweenWeaponAndEnemy = Math.hypot(
        weapon.x - enemy.x,
        weapon.y - enemy.y
      );
      if (distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1) {
        killEnemySound.play();
        if (enemy.radius > weapon.damage + 8) {
          gsap.to(enemy, {
            radius: enemy.radius - weapon.damage,
          });
          setTimeout(() => {
            weapons.splice(weaponIndex, 1);
          }, 0);
        } else {
          for (let i = 0; i < enemy.radius * 2; i++) {
            particles.push(
              new Particle(weapon.x, weapon.y, Math.random() * 2, enemy.color, {
                x: (Math.random() - 0.5) * (Math.random() * 7),
                y: (Math.random() - 0.5) * (Math.random() * 7),
              })
            );
          }

          playerScore += 10;
          scoreBoard.innerHTML = `Score : ${playerScore}`;
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            weapons.splice(weaponIndex, 1);
          }, 0);
        }
      }
    });
  });
}

// setInterval(spawnEnemy, 1000);
// adding event listener to canvas to left click
canvas.addEventListener("click", (e) => {
  // console.log(e.clientY - canvas.height / 2);
  shootingSound.play();
  const myAngle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(myAngle) * 7,
    y: Math.sin(myAngle) * 7,
  };
  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      5,
      "white",
      velocity,
      lightWeaponDamage
    )
  );
});
// adding event listener to canvas to RIGHT click
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (playerScore <= 0) return;
  heavyWeaponSound.play();
  playerScore -= 2;
  scoreBoard.innerHTML = `Score : ${playerScore}`;
  // console.log(e.clientY - canvas.height / 2);
  const myAngle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(myAngle) * 3,
    y: Math.sin(myAngle) * 3,
  };
  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      30,
      "cyan",
      velocity,
      heavyWeaponDamage
    )
  );
});

addEventListener("keypress", (e) => {
  if (e.key === " ") {
    if (playerScore < 20) return;
    hugeWeaponSound.play();
    playerScore -= 20;
    scoreBoard.innerHTML = `Score : ${playerScore}`;

    hugeWeapons.push(new HugeWeapon(0, 0, 30, hugeWeaponDamage));
  }
});

animation();
addEventListener("contextmenu", (e) => e.preventDefault());

addEventListener("resize", (e) => {
  location.reload();
});
