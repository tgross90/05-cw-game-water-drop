// Game state variables
let gameActive = false;  // Tracks if game is currently running
let gameInterval;        // Stores the interval that creates drops
let lives = 3;           // Initialize lives
let score = 0;           // Initialize score
let dropSpeed = 4000;    // Initial drop speed in milliseconds
let dropsPerInterval = 1; // Initial number of drops per interval
let badDropChance = 0.2; // Initial chance of bad drops (20%)

const waterCan = document.getElementById('water-can');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

let waterCanPosition = gameContainer.offsetWidth / 2 - 30; // Initial position

let moveDirection = null; // Tracks the current movement direction
let moveAnimationFrame;   // Stores the animation frame ID

// Event listener for the start button
document.getElementById('start-btn').addEventListener('click', startGame);

// Event listeners for keydown and keyup
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
    if (event.key === 'ArrowLeft' && moveDirection === 'left') {
        moveDirection = null;
    } else if (event.key === 'ArrowRight' && moveDirection === 'right') {
        moveDirection = null;
    }
    if (!moveDirection) {
        cancelAnimationFrame(moveAnimationFrame);
        moveAnimationFrame = null;
    }
});

// Function to move the water can smoothly
function moveWaterCan() {
    if (!moveDirection) return;

    const step = 5; // Smaller step for smoother movement
    if (moveDirection === 'left') {
        waterCanPosition = Math.max(0, waterCanPosition - step);
    } else if (moveDirection === 'right') {
        waterCanPosition = Math.min(gameContainer.offsetWidth - 60, waterCanPosition + step);
    }
    waterCan.style.left = `${waterCanPosition}px`;

    moveAnimationFrame = requestAnimationFrame(moveWaterCan);
}

// Game initialization function
function startGame() {
    // Prevent multiple game instances
    if (gameActive) return;
    
    // Set up initial game state
    gameActive = true;
    document.getElementById('start-btn').disabled = true;
    score = 0;
    lives = 3;
    dropSpeed = 4000; // Reset drop speed
    dropsPerInterval = 1; // Reset drops per interval
    badDropChance = 0.2; // Reset bad drop chance
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    
    // Start creating drops every 1000ms (1 second)
    gameInterval = setInterval(() => {
        for (let i = 0; i < dropsPerInterval; i++) {
            createDrop();
        }
    }, 1000);
}

// Function to check for collisions
function checkCollision(drop) {
    if (!drop || !waterCan) return false;

    const dropLeft = drop.offsetLeft;
    const dropTop = drop.offsetTop;
    const dropRight = dropLeft + drop.offsetWidth;
    const dropBottom = dropTop + drop.offsetHeight;

    const waterCanLeft = waterCan.offsetLeft;
    const waterCanTop = waterCan.offsetTop;
    const waterCanRight = waterCanLeft + waterCan.offsetWidth;
    const waterCanBottom = waterCanTop + waterCan.offsetHeight;

    return !(
        dropBottom < waterCanTop ||
        dropTop > waterCanBottom ||
        dropRight < waterCanLeft ||
        dropLeft > waterCanRight
    );
}

// Function to handle collision
function handleCollision(drop, isBadDrop) {
    drop.remove();
    if (isBadDrop) {
        lives--;
        livesElement.textContent = lives;
        if (lives === 0) {
            endGame();
        }
    } else {
        score += 1; // Increment score by 1 for each good drop
        scoreElement.textContent = score;

        // Increase drop speed, number of drops, and bad drop chance at score milestones
        if ([10, 20, 30, 40, 50].includes(score)) {
            dropSpeed = Math.max(1000, dropSpeed - 500); // Decrease drop duration, minimum 1s
            dropsPerInterval = Math.min(5, dropsPerInterval + 1); // Increase drops, max 5
            badDropChance = Math.min(0.5, badDropChance + 0.05); // Increase bad drop chance, max 50%
        }
    }
}

// End the game
function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    document.getElementById('start-btn').disabled = false;
    alert('Game Over! Your score: ' + score);
}

// Function to animate the drop manually
function animateDrop(drop, isBadDrop) {
    let pos = 0;
    const fallSpeed = gameContainer.offsetHeight / (dropSpeed / 16); // roughly 60fps

    const dropFall = () => {
        if (!gameActive) return;

        pos += fallSpeed;
        drop.style.top = `${pos}px`;

        // Collision check using real position
        if (checkCollision(drop)) {
            handleCollision(drop, isBadDrop);
            drop.remove();
            return;
        }

        // Remove if it hits the bottom
        if (pos >= gameContainer.offsetHeight) {
            drop.remove();
            return;
        }

        requestAnimationFrame(dropFall);
    };

    requestAnimationFrame(dropFall);
}

// Function to create and manage individual water drops
function createDrop() {
    const drop = document.createElement('div');
    
    // Randomly determine if this drop is good or bad based on badDropChance
    const isBadDrop = Math.random() < badDropChance;
    drop.className = isBadDrop ? 'water-drop bad-drop' : 'water-drop';
    
    // Create random size variation for visual interest
    const scale = 0.8 + Math.random() * 0.7;  // Results in 80% to 150% of original size
    drop.style.transform = `scale(${scale})`;
    
    // Position drop randomly along the width of the game container
    const gameWidth = gameContainer.offsetWidth;
    const randomX = Math.random() * (gameWidth - 40);
    drop.style.left = `${randomX}px`;
    
    // Add drop to game container
    gameContainer.appendChild(drop);

    // Animate the drop manually
    animateDrop(drop, isBadDrop);
}
