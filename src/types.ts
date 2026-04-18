// src/types.ts

export type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface IPiece {
    x: number;
    y: number;
    color: string;
    shape: number[][];
    type: PieceType;
    rotation: number;
}

export interface Point {
    x: number;
    y: number;
}
