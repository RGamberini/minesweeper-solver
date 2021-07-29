import { ComputedSpace } from "../ai/computed_space";
import { Model } from "../model/model";
import { Space } from "../model/space";
import { View } from "../view/view";
import html from "./test.html"

export class TestAI {
    private parent: HTMLElement;
    private main_container: HTMLElement;
    private body: HTMLElement;
    private colors: Map<string, Element[]>;
    constructor() {
        this.main_container = document.querySelector("#main")!;
        this.body = document.querySelector("body")!;
        this.body.innerHTML += html;
        this.parent = document.createElement("div");
        this.parent.setAttribute("style", "display: flex")
        document.querySelector("body")?.appendChild(this.parent);

        this.colors = new Map();
    }

    public add(model: Model) {
        let container = document.createElement("div");
        container.classList.add("container");
        container.setAttribute("style", "margin: 8px")
        this.parent.appendChild(container);
        new View(model, container);
    }

    public addColor(space: Space | ComputedSpace, color: string) {
        let element = this.main_container.querySelector(`[x="${space.getX()}"][y="${space.getY()}"]`)!;
        for (let child of element.children) {
            if (!this.colors.has(color))
                this.colors.set(color, []);
            this.colors.get(color)?.push(child);
            child.classList.add(color);
        }
    }

    public clearColors() {
        for (let color of this.colors.keys()) {
            this.colors.get(color)!.forEach(element => element.classList.remove(color));
        }
    }

    public clear() {
        this.parent.innerHTML = ""
    }
}