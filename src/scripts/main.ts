import {View} from "./View/view"
import {Game} from "./game"
import {Controller} from "./controller"
import {AI} from "./ai"
import "../styles/style.css"

const container = (document.querySelector(".container") as HTMLElement);
if (container !== null) {
    const model = new Model(4, 5);
    const view = new View(model, container);
    const game = new Game(model, view);
    const controller = new Controller(view, game);
    const ai = new AI(game);
}