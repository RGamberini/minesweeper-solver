import { Model } from "../model/model";
import { SpaceView } from "./space_view";

export class View {
    private model: Model;
    private spaces: SpaceView[][];
    public container: HTMLElement;

    constructor(model: Model, container: HTMLElement) {
        this.container = container;
        this.model = model;
        this.spaces = [];
        for (let x = 0; x < model.size; x++) {
            this.spaces[x] = []
            let row = document.createElement("div");
            row.setAttribute("class", "column");
            this.container!.appendChild(row);
            for (let y = 0; y < model.size; y++) {
                let space = document.createElement("div");
                space.setAttribute("class", "space");
                space.setAttribute("x", x.toString());
                space.setAttribute("y", y.toString());
                space.setAttribute("title", `(${x.toString()}, ${y.toString()})`);

                row.appendChild(space);

                this.spaces[x][y] = new SpaceView(space);
                this.spaces[x][y].update(model.getSpace(x, y))
            }
        }
    }

    public update(newModel?: Model) {
        if (newModel)
            this.model = newModel;
        for (let x = 0; x < this.model.size; x++) {
            for (let y = 0; y < this.model.size; y++) {
                this.spaces[x][y].update(this.model.getSpace(x, y));
            }
        }
    }

    public getSpace(x: number, y: number): SpaceView {
        return this.spaces[x][y];
    }

    public getSize(): number {
        return this.model.size;
    }

    public getNeighbors(x: number, y: number): SpaceView[] {
        return this.model.getNeighbors(x, y).map(space => this.getSpace(space.x, space.y));
    }

    public showBombs() {
        for (let x = 0; x < this.model.size; x++) {
            for (let y = 0; y < this.model.size; y++) {
                if (this.model.getSpace(x, y).mine && !this.model.getSpace(x, y).flagged)
                    this.spaces[x][y].showBomb()
            }
        }
    }
}