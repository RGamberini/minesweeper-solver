import { Space } from "./space"
import { fixed_shuffle, pre_filled_array } from "../util";
export class Model {
    public size: number;
    public numMines: number;
    private grid: Space[][];
    private static directions = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]]
    private flags: number;

    constructor(size: number, numMines: number, grid?: Space[][]) {
        this.size = size;
        this.numMines = numMines;
        this.flags = 0;
        if (!grid) {
            this.grid = [];
            this.buildGrid()
        } else {
            this.grid = grid;
        }
    }

    private getMines(mines: boolean[], x: number, y: number): number {
        let index = (x * this.size) + y;
        if (mines[index])
            return 0;
        return Model.directions
            .map(direction => {
                return { x: x + direction[0], y: y + direction[1] }
            })
            .filter(neighbor_coord => this.inBounds(neighbor_coord.x, neighbor_coord.y))
            .map(neighbor_cord => mines[(neighbor_cord.x * this.size) + neighbor_cord.y])
            .reduce((sum, n) => sum + (n ? 1 : 0), 0)
    }

    private buildGrid() {
        let mines = fixed_shuffle(
            pre_filled_array((this.size * this.size) - this.numMines, false).concat(
                pre_filled_array(this.numMines, true))
        );

        for (let x = 0; x < this.size; x++) {
            this.grid[x] = []
            for (let y = 0; y < this.size; y++) {
                this.grid[x][y] = new Space(x, y, mines[(x * this.size) + y], this.getMines(mines, x, y))
            }
        }
    }

    public setFlag(x: number, y: number, flag: boolean) {
        this.flags += flag ? 1 : -1;
        this.grid[x][y].flagged = flag;
    }

    public toggleFlag(x: number, y: number) {
        this.setFlag(x, y, !this.grid[x][y].flagged);
    }

    public getFlags(): number {
        return this.flags;
    }

    public inBounds(x: number, y: number) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    public getSpace(x: number, y: number): Space {
        return this.grid[x][y];
    }

    public getNeighbors(x: number, y: number): Space[] {
        return Model.directions
            .filter(direction => this.inBounds(x + direction[0], y + direction[1]))
            .map(direction => this.getSpace(x + direction[0], y + direction[1]));
    }

    public getNumFlags(x: number, y: number): number {
        return this.getNeighbors(x, y)
            .map(space => space.flagged)
            .reduce((sum, n) => sum + (n ? 1 : 0), 0);
    }

    public clone() {
        let grid: Space[][] = []
        for (let x = 0; x < this.size; x++) {
            grid[x] = []
            for (let y = 0; y < this.size; y++) {
                grid[x][y] = this.getSpace(x, y).clone()
            }
        }
        let result = new Model(this.size, this.numMines, grid);
        result.flags = this.flags;
        return result;
    }
}