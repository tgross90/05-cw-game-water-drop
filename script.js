// Game state variables
let gameActive = false;
let gameInterval;
let lives = 3;
let score = 0;
let dropSpeed = 5000;
let dropsPerInterval = 1;
let badDropChance = 0.2;

const waterCan = document.getElementById('water-can');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over-screen');
const levelBar = document.getElementById('level-bar');

let waterCanPosition = gameContainer.offsetWidth / 2 - 30;

let moveDirection = null;
let moveAnimationFrame = null;

// Arrow key listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.addEventListener('keydown', (event) => {
    if (!gameActive) return;
    if (event.key === 'ArrowLeft') {
        moveDirection = 'left';
        if (!moveAnimationFrame) moveWaterCan();
    } else if (event.key === 'ArrowRight') {
        moveDirection = 'right';
        if (!moveAnimationFrame) moveWaterCan();
    }
});
document.addEventListener('keyup', (event) => {
    if ((event.key === 'ArrowLeft' && moveDirection === 'left') || (event.key === 'ArrowRight' && moveDirection === 'right')) {
        moveDirection = null;
        cancelAnimationFrame(moveAnimationFrame);
        moveAnimationFrame = null;
    }
});

function moveWaterCan() {
    if (!moveDirection) return;
    const step = 10; // Increased step size from 5 to 10
    if (moveDirection === 'left') {
        waterCanPosition = Math.max(0, waterCanPosition - step);
    } else if (moveDirection === 'right') {
        waterCanPosition = Math.min(gameContainer.offsetWidth - 60, waterCanPosition + step);
    }
    waterCan.style.left = `${waterCanPosition}px`;
    moveAnimationFrame = requestAnimationFrame(moveWaterCan);
}

function startGame() {
    if (gameActive) return;

    // Reset UI and state
    gameActive = true;
    document.getElementById('start-btn').disabled = true;
    gameOverScreen.style.display = 'none';
    score = 0;
    lives = 3;
    dropSpeed = 2000;
    dropsPerInterval = 1;
    badDropChance = 0.2;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelBar.value = 0;

    gameInterval = setInterval(() => {
        for (let i = 0; i < dropsPerInterval; i++) {
            createDrop();
        }
    }, 1000);
}

function checkCollision(drop) {
    if (!drop || !waterCan) return false;

    const dropRect = drop.getBoundingClientRect();
    const canRect = waterCan.getBoundingClientRect();
    return !(
        dropRect.bottom < canRect.top ||
        dropRect.top > canRect.bottom ||
        dropRect.right < canRect.left ||
        dropRect.left > canRect.right
    );
}

function handleCollision(drop, isBadDrop) {
    drop.remove();
    if (isBadDrop) {
        lives--;
        livesElement.textContent = lives;
        badSound.play();

        // Quick visual feedback
        gameContainer.style.backgroundColor = '#ffcccc';
        setTimeout(() => gameContainer.style.backgroundColor = '', 100);

        if (lives === 0) endGame();
    } else {
        score += 1;
        scoreElement.textContent = score;
        goodSound.play();

        // Level/progression logic
        if ([10, 20, 30, 40, 50].includes(score)) {
            dropSpeed = Math.max(1000, dropSpeed - 500);
            dropsPerInterval = Math.min(5, dropsPerInterval + 1);
            badDropChance = Math.min(0.5, badDropChance + 0.05);
            levelBar.value = score / 10;
        }
    }
}

function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    document.getElementById('start-btn').disabled = false;

    finalScoreElement.textContent = score;

    // Append game-over-screen to game-container for proper positioning
    gameContainer.appendChild(gameOverScreen);
    gameOverScreen.style.display = 'block';
}

function animateDrop(drop, isBadDrop) {
    let startTime = null;
    const containerHeight = gameContainer.offsetHeight;

    function dropFall(timestamp) {
        if (!gameActive) return;

        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        // Calculate position based on time elapsed
        const progress = elapsed / dropSpeed;
        const pos = progress * containerHeight;
        drop.style.top = `${pos}px`;

        if (checkCollision(drop)) {
            handleCollision(drop, isBadDrop);
            drop.remove();
            return;
        }

        if (pos >= containerHeight) {
            drop.remove();
            return;
        }

        requestAnimationFrame(dropFall);
    }

    requestAnimationFrame(dropFall);
}

function createDrop() {
    const drop = document.createElement('div');
    const isBadDrop = Math.random() < badDropChance;
    drop.className = isBadDrop ? 'water-drop bad-drop' : 'water-drop';

    const scale = 0.8 + Math.random() * 0.7;
    drop.style.transform = `scale(${scale})`;

    const gameWidth = gameContainer.offsetWidth;
    const randomX = Math.random() * (gameWidth - 40);
    drop.style.left = `${randomX}px`;

    gameContainer.appendChild(drop);
    animateDrop(drop, isBadDrop);
}
