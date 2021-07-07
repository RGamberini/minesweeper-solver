function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

Math.random = mulberry32(2);

function shuffle(array: any[]) {
    var currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

class Model {
    public size: number;
    public numMines: number;
    private grid: Space[][];
    private static directions = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]]
    private flags: number;

    constructor(size: number, numMines: number, model?: Model) {
        this.size = size;
        this.numMines = numMines;
        this.flags = 0;

        if (!model) {
            this.grid = [];
            this.buildGrid()
        }
        else
            this.grid = model.grid;
    }

    private getMines(mines: boolean[], x: number, y: number): number {
        let index = (x * this.size) + y;
        if (mines[index])
            return 0;
        return Model.directions
            .map(direction => {
                return {x: x + direction[0], y: y + direction[1]}
            })
            .filter(neighbor_coord => this.inBounds(neighbor_coord.x, neighbor_coord.y))
            .map(neighbor_cord => mines[(neighbor_cord.x * this.size) + neighbor_cord.y])
            .reduce((sum, n) => sum + (n ? 1:0), 0)
    }

    private buildGrid() {
        let mines = shuffle(Array.from({ length: (this.size * this.size) - this.numMines }, n => n = false).concat(Array.from({ length: this.numMines }, n => n = true)));
        (window as any).mines = mines;
        for (let x = 0; x < this.size; x++) {
            this.grid[x] = []
            for (let y = 0; y < this.size; y++) {
                this.grid[x][y] = new Space(x, y, mines[(x * this.size) + y], this.getMines(mines, x, y))
            }
        }
    }

    public setFlag(x: number, y: number, flag: boolean) {
        this.flags += flag ? 1:-1;
        this.grid[x][y].flagged = flag;
    }

    public toggleFlag(x: number, y: number) {
        this.setFlag(x, y, this.grid[x][y].flagged);
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
            .reduce((sum, n) => sum + (n ? 1:0), 0);
    }
}