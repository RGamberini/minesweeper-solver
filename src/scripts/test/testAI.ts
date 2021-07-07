import { Model } from "../Model/model";
import { View } from "../View/view";

export class TestAI {
    private parent: HTMLElement;
    constructor() {
        this.parent = document.createElement("div");
        this.parent.setAttribute("style", "display: flex")
        document.querySelector("body")?.appendChild(this.parent);
    }

    public add(model: Model) {
        let container = document.createElement("div");
        container.classList.add("container");
        container.setAttribute("style", "margin: 8px")
        this.parent.appendChild(container);
        new View(model, container);
    }
}