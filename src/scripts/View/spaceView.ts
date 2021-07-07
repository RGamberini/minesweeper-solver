import bomb_img from "@/assets/bomb-solid.svg"
import flag_img from "@/assets/flag.png"
import { Space } from "../Model/space";
export class SpaceView {
    private static colors = ["#0200FD", "#017E00", "#FE0001", "#01017E", "#830003", "#008080", "#000000", "#808080"]
    public container: Element;
    public revealed!: Element;
    public mask!: Element;
    private flag!: Element;

    constructor(container: Element) {
        this.container = container;
        this.createContents()
    }

    private createContents() {
        this.revealed = document.createElement("div");
        this.revealed.setAttribute("class", "space revealed");
        this.container.appendChild(this.revealed)

        this.mask = document.createElement("div")
        this.mask.setAttribute("class", "space mask");
        this.container.appendChild(this.mask)

        this.flag = document.createElement("img");
        this.flag.setAttribute("src", flag_img);
        this.flag.classList.add("flag");
        this.flag.classList.add("hide");
        this.mask.appendChild(this.flag);
    }

    public update(space: Space) {
        this.setRevealed(space.revealed);
        this.setNumMines(space.getNumMines())
        this.updateFlag(space.flagged)
    }

    private setRevealed(revealed: boolean) {
        if (revealed)
            this.mask.classList.add("hide")
        else
            this.mask.classList.remove("hide")
    }

    private setNumMines(numMines: number) {
        this.revealed.innerHTML = `<p>${numMines === 0 ? "" : numMines.toString()}</p>`
        this.revealed.setAttribute("style", `color: ${SpaceView.colors[numMines - 1]}`)
    }

    public showBomb() {
        let bomb = document.createElement("img");
        bomb.setAttribute("src", bomb_img);
        this.mask.appendChild(bomb);
    }

    public updateFlag(flagged: boolean) {
        if (flagged)
            this.flag.classList.remove("hide")
        else
            this.flag.classList.add("hide")
    }
}