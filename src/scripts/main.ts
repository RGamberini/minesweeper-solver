import {Model} from "./Model/model"
import {View} from "./View/view"
import {Game} from "./game"
import {Controller} from "./controller"
import {AI} from "./ai"
import "../styles/style.css"
const EASY = [4, 5];
const BEGGINER = [9, 10];

let dificulty = BEGGINER;
const container = (document.querySelector(".container") as HTMLElement);
const model = new Model(dificulty[0], dificulty[1]);
const view = new View(model, container);
const game = new Game(model, view);
const controller = new Controller(view, game);
const ai = new AI(game);

(window as any).game = game;