import "../styles/style.css"
import { AI } from "./ai/ai";
import { Controller } from "./controller";
import { Game } from "./game";
import { Model } from "./model/model";
import { View } from "./view/view";
const dificulties = {
    "EASY": [4, 4, 5],
    "BEGGINER": [9, 9, 10],
    "TEST": [11, 11, 17],
    "INTERMEDIATE": [16, 16, 40],
    "EXPERT": [30, 16, 99]
}
function getKeyByValue(object: any, value: any) {
    return Object.keys(object).find(key => object[key] === value);
}
let dificulty = dificulties["INTERMEDIATE"];
console.log(`DEBUG: Starting board on ${getKeyByValue(dificulties, dificulty)} dificulty`)
const container = (document.querySelector(".container") as HTMLElement);
const model = new Model(dificulty[0], dificulty[1], dificulty[2]);
const view = new View(model, container);
const game = new Game(model, view);
const controller = new Controller(view, game);
const ai = new AI(game);

(window as any).Model = Model;
(window as any).model = model;
(window as any).game = game;
(window as any).view = view;
(window as any).ai = ai;