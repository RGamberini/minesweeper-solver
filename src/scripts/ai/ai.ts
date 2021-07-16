import { Game } from "../game";
import { Model } from "../model/model";
import { Space } from "../model/space";
import { TestAI } from "../test/testAI";
import { static_random, pre_filled_2d_array } from "../util";
import { Backtrack, BruteForce, Solver } from "./algorithms";
import { ComputedSpace } from "./computed_space";

export class AIInfoResult {
    public perimeter: Space[] = [];
    public unsolved_spaces: Space[] = [];
    public computed_spaces: ComputedSpace[] = [];
}

export class AI {
    private game: Game;
    private testing: boolean = true;
    private testAI?: TestAI;
    private solver: Solver;
    constructor(game: Game) {
        this.game = game
        if (this.testing) this.testAI = new TestAI();
        this.makeFistClick();
        document.querySelector("#make_move")?.addEventListener("click", event => {
            console.log("Debug: AI making move");
            this.makeMove()
            this.getInfo()
        });
        this.solver = new Backtrack.Backtrack();
    }

    makeFistClick() {
        const x = Math.round(static_random() * (this.game.getSize() - 1));
        const y = Math.round(static_random() * (this.game.getSize() - 1));
        console.log(`Debug: AI making random first move (${x}, ${y})`)
        // this.game.getSpaceView(x, y).revealed.classList.add("yellow");

        this.game.handleLeftClick(x, y);
    }

    getInfo() {
        console.log("Debug: Start getInfo()")
        let result = new AIInfoResult();
        for (let x = 0; x < this.game.getSize(); x++) {
            for (let y = 0; y < this.game.getSize(); y++) {
                let space = this.game.getSpace(x, y);
                if (!space.revealed || space.getNumMines() === 0)
                    continue;

                let unsolved = false;
                let new_space = new ComputedSpace(space);
                this.game.getNeighbors(space.x, space.y).forEach(neighbor => {
                    if (!neighbor.revealed && !neighbor.flagged) {
                        let index = result.perimeter.indexOf(neighbor);
                        if (index === -1) index = result.perimeter.push(neighbor) - 1;
                        new_space.addIndex(index);
                        unsolved = true;
                    }
                });
                if (unsolved) {
                    result.computed_spaces.push(new_space);
                    result.unsolved_spaces.push(space)
                }
            }
        }
        result.perimeter.forEach(space => {
            this.game.getSpaceView(space.x, space.y).mask.classList.add("blue");
        });

        result.unsolved_spaces.forEach(space => {
            this.game.getSpaceView(space.x, space.y).revealed.classList.add("red");
        });
        console.log("Debug: End getInfo()")
        return result;
    }

    public makeMove() {
        // this.testAI?.clear()
        let model = this.game.getModel();
        let info = this.getInfo();

        let result = this.solver.solve(model, info);

        result.mines.forEach(space => this.game.handleRightClick(space.x, space.y));
        result.safe_spaces.forEach(space => this.game.handleLeftClick(space.x, space.y));

        info.perimeter.forEach(space => {
            this.game.getSpaceView(space.x, space.y).mask.classList.remove("blue");
        });

        info.unsolved_spaces.forEach(space => {
            this.game.getSpaceView(space.x, space.y).revealed.classList.remove("red");
        });
        console.log("Debug: End makeMove()")
        // perimeter.forEach(space => this.game.getSpaceView(space.x, space.y).mask.textContent = (times_flagged[space.x][space.y] / valid_models.length * 100).toString())}
    }
}