import { fixed_shuffle, pre_filled_array } from "../util";
import { Space } from "./space";

export class Model {
    public height: number;
    public width: number;
    public numMines: number;
    private grid: Space[][];
    private static directions = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]
    private flags: number;

    constructor(width: number, height: number, numMines: number, grid?: Space[][]) {
        this.width = width;
        this.height = height;
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
        let index = (x * this.width) + y;
        if (mines[index])
            return 0;
        return Model.directions
            .map(direction => {
                return { x: x + direction[0], y: y + direction[1] }
            })
            .filter(neighbor_coord => this.inBounds(neighbor_coord.x, neighbor_coord.y))
            .map(neighbor_cord => mines[(neighbor_cord.x * this.width) + neighbor_cord.y])
            .reduce((sum, n) => sum + (n ? 1 : 0), 0)
    }

    private buildGrid() {
        let mines = fixed_shuffle(
            pre_filled_array((this.width * this.height) - this.numMines, false).concat(
                pre_filled_array(this.numMines, true))
        );

        for (let x = 0; x < this.width; x++) {
            this.grid[x] = []
            for (let y = 0; y < this.height; y++) {
                this.grid[x][y] = new Space(x, y, mines[(x * this.width) + y], this.getMines(mines, x, y))
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
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
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
        for (let x = 0; x < this.width; x++) {
            grid[x] = []
            for (let y = 0; y < this.height; y++) {
                grid[x][y] = this.getSpace(x, y).clone()
            }
        }
        let result = new Model(this.width, this.height, this.numMines, grid);
        result.flags = this.flags;
        return result;
    }
}