import { Game } from "./game";
import { View } from "./view/view";

export class Controller {
    private view: View;
    private game: Game;
    private leftButtonDown: boolean = false;
    private rightButtonDown: boolean = false;

    constructor(view: View, game: Game) {
        this.view = view;
        this.game = game;
        let currentElement = document.createElement("null");

        view.container.addEventListener("mousedown", (e: MouseEvent) => {
            let space = (e.target as HTMLElement)
            currentElement = space;
            e.preventDefault()

            if (e.button === 0)
                this.leftButtonDown = true;

            if (e.button === 2)
                this.rightButtonDown = true;

            if (this.leftButtonDown && this.rightButtonDown)
                this.handleDoublePress(currentElement);
            else if (this.leftButtonDown)
                this.handleLeftPress(currentElement);
        });

        view.container.addEventListener("mousemove", (e: MouseEvent) => {
            let space = (e.target as HTMLElement);
            if (currentElement === space)
                return;
            if (this.leftButtonDown && this.rightButtonDown) {
                currentElement.classList.remove("pushed");
                let parentElement = currentElement.parentElement;
                if (!parentElement)
                    return
                let x = parseInt(parentElement.getAttribute("x")!);
                let y = parseInt(parentElement.getAttribute("y")!);

                this.view.getNeighbors(x, y).forEach(viewSpace => viewSpace.mask.classList.remove("pushed"));
                this.handleDoublePress(space);
            } else if (this.leftButtonDown) {
                currentElement.classList.remove("pushed");
                if (space.classList.contains("mask"))
                    space.classList.add("pushed");
            }
            currentElement = space;
        });

        view.container.addEventListener("mouseup", (e: MouseEvent) => {
            if (this.leftButtonDown && this.rightButtonDown)
                this.handleDoubleRelease(currentElement)
            else if (this.leftButtonDown)
                this.handleLeftRelease(currentElement)
            else if (this.rightButtonDown)
                this.handleRightRelease(currentElement)

            if (e.button === 0)
                this.leftButtonDown = false;

            if (e.button === 2)
                this.rightButtonDown = false;
        });

        view.container.addEventListener("contextmenu", e => e.preventDefault());
    }

    handleLeftPress(currentElement: HTMLElement) {
        if (currentElement.classList.contains("mask"))
            currentElement.classList.add("pushed");
    }

    handleDoublePress(currentElement: HTMLElement) {
        if (currentElement.classList.contains("mask"))
            currentElement.classList.add("pushed");

        let parentElement = currentElement.parentElement;
        if (!parentElement)
            return
        let x = parseInt(parentElement.getAttribute("x")!);
        let y = parseInt(parentElement.getAttribute("y")!);


        this.view.getNeighbors(x, y).forEach(neighbor => {
            if (!neighbor.mask.classList.contains("hide") && neighbor.mask.querySelector(".flag:not(.hide)") === null)
                neighbor.mask.classList.add("pushed")
        });
    }

    handleLeftRelease(currentElement: HTMLElement) {
        currentElement.classList.remove("pushed");

        let parentElement = currentElement.parentElement;
        if (!parentElement)
            return
        let x = parseInt(parentElement.getAttribute("x")!);
        let y = parseInt(parentElement.getAttribute("y")!);
        this.game.handleLeftClick(x, y);
    }
    handleRightRelease(currentElement: HTMLElement) {
        let parentElement = currentElement.parentElement;
        if (!parentElement)
            return

        let x = parseInt(parentElement.getAttribute("x")!);
        let y = parseInt(parentElement.getAttribute("y")!);

        this.game.handleRightClick(x, y);
    }
    handleDoubleRelease(currentElement: HTMLElement) {
        currentElement.classList.remove("pushed");
        let parentElement = currentElement.parentElement;
        if (!parentElement)
            return
        this.leftButtonDown = false;
        this.rightButtonDown = false;
        let x = parseInt(parentElement.getAttribute("x")!);
        let y = parseInt(parentElement.getAttribute("y")!);

        this.view.getNeighbors(x, y).forEach(viewSpace => viewSpace.mask.classList.remove("pushed"));
        this.game.handleDoubleClick(x, y);
    }
}