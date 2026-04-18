import { COLS, KEY } from './constants.js';
import { Piece } from './piece.js';
export class Game {
    constructor(board, nextCtx) {
        this.activePiece = null;
        this.nextPiece = null;
        this.bag = [];
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.requestId = null;
        this.time = { start: 0, elapsed: 0, level: 1000 };
        this.board = board;
        this.nextCtx = nextCtx;
    }
    start() {
        this.reset();
        this.activePiece = this.getNextPieceFromBag();
        this.nextPiece = this.getNextPieceFromBag();
        this.activePiece.setSpawnPosition(COLS);
        this.animate();
    }
    reset() {
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.board.grid = this.board.getEmptyGrid();
        this.bag = [];
        this.updateStats();
    }
    getNextPieceFromBag() {
        if (this.bag.length === 0) {
            this.bag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
            // Shuffle bag
            for (let i = this.bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
            }
        }
        return new Piece(this.bag.pop());
    }
    animate(now = 0) {
        this.time.elapsed = now - this.time.start;
        if (this.time.elapsed > this.time.level) {
            this.time.start = now;
            if (!this.drop()) {
                this.gameOver = true;
                alert('GAME OVER');
                return;
            }
        }
        this.board.draw(this.activePiece);
        this.drawNext();
        this.requestId = requestAnimationFrame((n) => this.animate(n));
    }
    drop() {
        if (!this.activePiece)
            return false;
        const p = this.activePiece.clone();
        p.y++;
        if (this.board.valid(p)) {
            this.activePiece.y++;
            return true;
        }
        else {
            this.freeze();
            this.clearLines();
            if (this.activePiece.y === 0) {
                return false; // Game Over
            }
            this.spawnNewPiece();
            return true;
        }
    }
    freeze() {
        if (this.activePiece) {
            this.board.freeze(this.activePiece);
        }
    }
    clearLines() {
        const lines = this.board.clearLines();
        if (lines > 0) {
            this.lines += lines;
            this.score += this.calculateScore(lines);
            this.level = Math.floor(this.lines / 10) + 1;
            this.time.level = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateStats();
        }
    }
    calculateScore(lines) {
        const linePoints = [0, 100, 300, 500, 800];
        return linePoints[lines] * this.level;
    }
    spawnNewPiece() {
        this.activePiece = this.nextPiece;
        this.nextPiece = this.getNextPieceFromBag();
        this.activePiece.setSpawnPosition(COLS);
    }
    handleKey(event) {
        if (this.gameOver || !this.activePiece)
            return;
        const p = this.activePiece.clone();
        switch (event.key) {
            case KEY.LEFT:
                p.x--;
                if (this.board.valid(p))
                    this.activePiece.x--;
                break;
            case KEY.RIGHT:
                p.x++;
                if (this.board.valid(p))
                    this.activePiece.x++;
                break;
            case KEY.DOWN:
                this.drop();
                break;
            case KEY.UP:
            case KEY.ROTATE_CW:
                this.rotate(true);
                break;
            case KEY.ROTATE_CCW:
                this.rotate(false);
                break;
            case KEY.SPACE:
                this.hardDrop();
                break;
        }
    }
    rotate(cw) {
        if (!this.activePiece)
            return;
        const p = this.activePiece.clone();
        const { prev, next } = cw ? p.rotateCW() : p.rotateCCW();
        const kicks = p.getKickTests(prev, next);
        for (const [kx, ky] of kicks) {
            p.x += kx;
            p.y -= ky; // SRS uses positive y as up, our grid uses positive y as down
            if (this.board.valid(p)) {
                if (cw)
                    this.activePiece.rotateCW();
                else
                    this.activePiece.rotateCCW();
                this.activePiece.x = p.x;
                this.activePiece.y = p.y;
                return;
            }
            // Reset for next kick test
            p.x -= kx;
            p.y += ky;
        }
    }
    hardDrop() {
        if (!this.activePiece)
            return;
        while (this.board.valid(this.activePiece)) {
            this.activePiece.y++;
        }
        this.activePiece.y--;
        this.drop();
    }
    updateStats() {
        document.getElementById('score').innerText = this.score.toString();
        document.getElementById('lines').innerText = this.lines.toString();
        document.getElementById('level').innerText = this.level.toString();
    }
    drawNext() {
        if (!this.nextPiece)
            return;
        this.nextCtx.clearRect(0, 0, this.nextCtx.canvas.width, this.nextCtx.canvas.height);
        this.nextCtx.fillStyle = this.nextPiece.color;
        const offset = this.nextPiece.type === 'I' || this.nextPiece.type === 'O' ? 0 : 5;
        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.nextCtx.fillRect(x * 20 + offset, y * 20 + offset, 20, 20);
                }
            });
        });
    }
}
