import { SHAPES, COLORS, WALL_KICK } from './constants.js';
export class Piece {
    constructor(type) {
        this.type = type;
        this.color = COLORS[type];
        this.shape = SHAPES[type].map(row => [...row]);
        this.x = 0;
        this.y = 0;
        this.rotation = 0; // 0: 0, 1: 90, 2: 180, 3: 270
    }
    setSpawnPosition(cols) {
        this.x = Math.floor(cols / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }
    rotateCW() {
        const prevRotation = this.rotation;
        this.rotation = (this.rotation + 1) % 4;
        this.shape = this.transposeAndReverse(this.shape);
        return { prev: prevRotation, next: this.rotation };
    }
    rotateCCW() {
        const prevRotation = this.rotation;
        this.rotation = (this.rotation + 3) % 4;
        // CCW is 3 CW rotations, or reverse then transpose
        this.shape = this.reverseAndTranspose(this.shape);
        return { prev: prevRotation, next: this.rotation };
    }
    transposeAndReverse(matrix) {
        const result = matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
        return result.map(row => row.reverse());
    }
    reverseAndTranspose(matrix) {
        const reversed = [...matrix].reverse();
        return reversed[0].map((_, colIndex) => reversed.map(row => row[colIndex]));
    }
    getKickTests(prev, next) {
        const key = `${prev}-${next}`;
        if (this.type === 'I') {
            return WALL_KICK.I[key] || [[0, 0]];
        }
        return WALL_KICK.NORMAL[key] || [[0, 0]];
    }
    clone() {
        const clone = new Piece(this.type);
        clone.x = this.x;
        clone.y = this.y;
        clone.rotation = this.rotation;
        clone.shape = this.shape.map(row => [...row]);
        return clone;
    }
}
