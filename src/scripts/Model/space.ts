export class Space {
    public x: number;
    public y: number;
    public mine: boolean;
    private numMines: number;
    public revealed: boolean;
    public flagged: boolean;

    constructor(x: number, y: number, mine: boolean, numMines: number) {
        this.x = x;
        this.y = y;
        this.mine = mine;
        this.numMines = numMines;
        this.revealed = false;
        this.flagged = false;
    }

    public getNumMines(): number {
        return this.numMines;
    }
}