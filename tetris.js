// Константы игры
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Эмодзи котов для разных фигур
const CAT_EMOJIS = {
    0: '🐱',   // Синий (I)
    1: '🐈',   // Оранжевый (O)
    2: '🐈‍⬛', // Чёрный (T)
    3: '😺',   // Розовый (S)
    4: '😸',   // Жёлтый (Z)
    5: '😹',   // Зелёный (J)
    6: '😻'    // Красный (L)
};

// Фигуры тетромино (7 типов)
const SHAPES = [
    // I
    [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    // O
    [
        [1,1],
        [1,1]
    ],
    // T
    [
        [0,1,0],
        [1,1,1],
        [0,0,0]
    ],
    // S
    [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    // Z
    [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    // J
    [
        [1,0,0],
        [1,1,1],
        [0,0,0]
    ],
    // L
    [
        [0,0,1],
        [1,1,1],
        [0,0,0]
    ]
];

class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        // Инициализация пустого поля
        this.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        
        // Создание первой фигуры
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        
        // Обновление UI
        this.updateScore();
        
        // Запуск игры
        this.gameLoop();
    }
    
    createPiece() {
        const type = Math.floor(Math.random() * SHAPES.length);
        return {
            shape: SHAPES[type],
            type: type,
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
            y: 0
        };
    }
    
    drawSquare(ctx, x, y, type) {
        const emoji = CAT_EMOJIS[type] || '🐱';
        ctx.font = `${BLOCK_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, x + BLOCK_SIZE / 2, y + BLOCK_SIZE / 2);
    }
    
    drawBoard() {
        // Очистка canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисование сетки
        this.ctx.strokeStyle = '#2a2a3e';
        this.ctx.lineWidth = 1;
        for (let row = 0; row <= ROWS; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * BLOCK_SIZE);
            this.ctx.lineTo(COLS * BLOCK_SIZE, row * BLOCK_SIZE);
            this.ctx.stroke();
        }
        for (let col = 0; col <= COLS; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * BLOCK_SIZE, 0);
            this.ctx.lineTo(col * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // Рисование установленных блоков
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (this.board[row][col]) {
                    this.drawSquare(this.ctx, col * BLOCK_SIZE, row * BLOCK_SIZE, this.board[row][col] - 1);
                }
            }
        }
        
        // Рисование текущей фигуры
        if (this.currentPiece) {
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        const x = (this.currentPiece.x + col) * BLOCK_SIZE;
                        const y = (this.currentPiece.y + row) * BLOCK_SIZE;
                        this.drawSquare(this.ctx, x, y, this.currentPiece.type);
                    }
                }
            }
        }
    }
    
    drawNext() {
        // Очистка next canvas
        this.nextCtx.fillStyle = '#1a1a2e';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const shape = this.nextPiece.shape;
            const blockSize = 25;
            const offsetX = (this.nextCanvas.width - shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - shape.length * blockSize) / 2;
            
            this.nextCtx.font = `${blockSize}px Arial`;
            this.nextCtx.textAlign = 'center';
            this.nextCtx.textBaseline = 'middle';
            
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        const x = offsetX + col * blockSize;
                        const y = offsetY + row * blockSize;
                        const emoji = CAT_EMOJIS[this.nextPiece.type];
                        this.nextCtx.fillText(emoji, x + blockSize / 2, y + blockSize / 2);
                    }
                }
            }
        }
    }
    
    validMove(piece, dx, dy, newShape) {
        const shape = newShape || piece.shape;
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = newX + col;
                    const y = newY + row;
                    
                    // Проверка границ
                    if (x < 0 || x >= COLS || y >= ROWS) {
                        return false;
                    }
                    
                    // Проверка столкновения с установленными блоками
                    if (y >= 0 && this.board[y][x]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    rotate(piece) {
        const shape = piece.shape;
        const N = shape.length;
        const rotated = Array(N).fill().map(() => Array(N).fill(0));
        
        // Поворот матрицы на 90 градусов по часовой стрелке
        for (let row = 0; row < N; row++) {
            for (let col = 0; col < N; col++) {
                rotated[col][N - 1 - row] = shape[row][col];
            }
        }
        
        return rotated;
    }
    
    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const y = this.currentPiece.y + row;
                    const x = this.currentPiece.x + col;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.type + 1;
                    }
                }
            }
        }
        
        // Проверка заполненных линий
        this.clearLines();
        
        // Создание новой фигуры
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        // Проверка окончания игры
        if (!this.validMove(this.currentPiece, 0, 0)) {
            this.endGame();
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = ROWS - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                // Удаление заполненной линии
                this.board.splice(row, 1);
                this.board.unshift(Array(COLS).fill(0));
                linesCleared++;
                row++; // Проверяем ту же строку снова
            }
        }
        
        if (linesCleared > 0) {
            // Подсчёт очков
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared] * this.level;
            this.lines += linesCleared;
            
            // Увеличение уровня каждые 10 линий
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            
            this.updateScore();
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
    }
    
    movePiece(dx, dy) {
        if (this.validMove(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }
    
    rotatePiece() {
        const rotated = this.rotate(this.currentPiece);
        if (this.validMove(this.currentPiece, 0, 0, rotated)) {
            this.currentPiece.shape = rotated;
            return true;
        }
        return false;
    }
    
    dropPiece() {
        if (!this.movePiece(0, 1)) {
            this.placePiece();
        }
    }
    
    endGame() {
        this.gameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    restart() {
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.gameOver = false;
        document.getElementById('gameOver').classList.add('hidden');
        this.init();
    }
    
    gameLoop(time = 0) {
        if (this.gameOver) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.dropTime += deltaTime;
        
        if (this.dropTime > this.dropInterval) {
            this.dropPiece();
            this.dropTime = 0;
        }
        
        this.drawBoard();
        this.drawNext();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Создание экземпляра игры
let game;

// Обработка клавиатуры
document.addEventListener('keydown', (e) => {
    if (!game || game.gameOver) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            game.movePiece(-1, 0);
            break;
        case 'ArrowRight':
            game.movePiece(1, 0);
            break;
        case 'ArrowDown':
            game.dropPiece();
            break;
        case 'ArrowUp':
            game.rotatePiece();
            break;
    }
});

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    game = new Tetris();
    window.game = game; // Экспорт для кнопки перезапуска
});
