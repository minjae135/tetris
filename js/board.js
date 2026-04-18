import { COLS, ROWS, BLOCK_SIZE, COLORS } from './constants.js';
export class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.grid = this.getEmptyGrid();
    }
    getEmptyGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }
    valid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                const x = p.x + dx;
                const y = p.y + dy;
                return (value === 0 ||
                    (this.isInsideWalls(x, y) && !this.isOccupied(x, y)));
            });
        });
    }
    isInsideWalls(x, y) {
        return x >= 0 && x < COLS && y < ROWS;
    }
    isOccupied(x, y) {
        return y >= 0 && this.grid[y] && this.grid[y][x] !== null;
    }
    freeze(p) {
        p.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value > 0) {
                    const y = p.y + dy;
                    const x = p.x + dx;
                    if (y >= 0) {
                        this.grid[y][x] = p.color;
                    }
                }
            });
        });
    }
    clearLines() {
        let lines = 0;
        this.grid.forEach((row, y) => {
            if (row.every(value => value !== null)) {
                lines++;
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(null));
            }
        });
        return lines;
    }
    draw(activePiece) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // Draw grid
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== null) {
                    this.drawBlock(x, y, value);
                }
            });
        });
        if (activePiece) {
            this.drawGhost(activePiece);
            this.drawPiece(activePiece);
        }
    }
    drawBlock(x, y, color, alpha = 1) {
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        // Block border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        this.ctx.globalAlpha = 1;
    }
    drawPiece(p) {
        p.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value > 0) {
                    this.drawBlock(p.x + dx, p.y + dy, p.color);
                }
            });
        });
    }
    drawGhost(p) {
        const ghost = p.clone();
        while (this.valid(ghost)) {
            ghost.y++;
        }
        ghost.y--;
        ghost.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value > 0) {
                    this.drawBlock(ghost.x + dx, ghost.y + dy, COLORS.GHOST, 0.5);
                }
            });
        });
    }
}
