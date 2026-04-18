// src/main.ts

import { COLS, ROWS, BLOCK_SIZE } from './constants.js';
import { Board } from './board.js';
import { Game } from './game.js';

const canvas = document.getElementById('board') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const nextCanvas = document.getElementById('next') as HTMLCanvasElement;
const nextCtx = nextCanvas.getContext('2d')!;

// Set canvas sizes
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

nextCanvas.width = 4 * 20;
nextCanvas.height = 4 * 20;

const board = new Board(ctx);
const game = new Game(board, nextCtx);

const startBtn = document.getElementById('start-btn')!;
startBtn.addEventListener('click', () => {
    game.start();
});

document.addEventListener('keydown', (event) => {
    game.handleKey(event);
});
