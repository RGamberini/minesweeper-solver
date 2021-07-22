import { Space } from "../model/space";

export enum ComputedSpaceResult {
    Invalid,
    Valid,
    Incomplete
}
export class ComputedSpace {
    private indices: number[] = [];
    public max: number = 0;
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
        let sum = this.indices.reduce((sum, n) => sum + spaces[n], 0);
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