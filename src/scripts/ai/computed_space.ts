import { Space } from "../model/space";

export enum ComputedSpaceResult {
    Invalid,
    Valid,
    Incomplete
}
export class ComputedSpace {
    private indices: number[] = [];
    private max: number = 0;
    private x: number = 0;
    private y: number = 0;

    constructor(space: Space) {
        this.x = space.x;
        this.y = space.y;
        this.max = space.getNumMines();
    }

    public addIndex(n: number) {
        this.indices.push(n);
    }

    public isValid(spaces: number[]) {
        console.log(`Computing space (${this.x}, ${this.y}) with ${this.indices.length} relevant indices. And spaces.length ${spaces.length}`);
        let sum = this.indices.reduce((sum, n) => sum + spaces[n], 0);
        console.log(this.indices);
        console.log(`${sum} is sum ${this.max} is max ${sum < this.max}`);
        if (sum < this.max) {
            return ComputedSpaceResult.Incomplete;
        } else if (sum === this.max) {
            return ComputedSpaceResult.Valid;
        } else {
            return ComputedSpaceResult.Invalid;
        }
    }

    public getX() {
        return this.x;
    }

    public getY() {
        return this.y;
    }
}