import {View} from "./View/view"
import {SpaceView} from "./View/spaceView"
export class Game {
    private view: View;
    private model: Model;
    private firstClick: boolean;

    constructor(model: Model, view: View) {
        this.view = view
        this.model = model
        this.firstClick = true;
    }

    public handleLeftClick(x: number, y: number): void {
        let space = this.model.getSpace(x, y);
        if ((space.getNumMines() !== 0 || space.mine) && this.firstClick) {
            console.log("FIRST CLICK MAKING NEW BOARD");
            while (space.getNumMines() !== 0 || space.mine) {
                this.model = new Model(this.model.size, this.model.numMines);
                space = this.model.getSpace(x, y);
            }
            this.view.update(this.model);
            this.firstClick = false;
        }
        if (space.revealed)
            return;
        if (space.mine) {
            this.view.showBombs()
            return;
        }
        this.reveal(space);
        this.view.update()

        this.firstClick = false;
    }

    handleRightClick(x: number, y: number) {
        let space = this.model.getSpace(x, y);
        if (space.revealed)
            return;
        this.model.toggleFlag(x, y);
        this.view.update();
    }

    handleDoubleClick(x: number, y: number) {
        let space = this.model.getSpace(x, y);
        if (!space.revealed)
            return;
        let numFlags = this.model.getNeighbors(x, y).reduce((sum, neighbor) => sum + (neighbor.flagged ? 1 : 0), 0);
        if (numFlags === space.getNumMines()) {
            this.model.getNeighbors(x, y)
                .filter(neighbor => !neighbor.flagged)
                .forEach(neighbor => this.handleLeftClick(neighbor.x, neighbor.y))
        }
    }

    public reveal(space: Space) {
        if (space.revealed)
            return;
        if (space.mine)
            return;
        space.revealed = true;
        if (space.getNumMines() === 0) {
            this.model.getNeighbors(space.x, space.y).forEach(neighbor => this.reveal(neighbor))
        }
    }

    public getModel(): Model {
        return this.model;
    }

    public getSize(): number {
        return this.model.size;
    }

    public getSpace(x: number, y: number): Space {
        return this.model.getSpace(x, y);
    }

    public getSpaceView(x: number, y: number): SpaceView {
        return this.view.getSpace(x, y);
    }

    public getNeighbors(x: number, y: number): Space[] {
        return this.model.getNeighbors(x, y);
    }
}