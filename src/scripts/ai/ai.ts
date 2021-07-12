import { Game } from "../game";
import { Model } from "../model/model";
import { Space } from "../model/space";
import { TestAI } from "../test/testAI";
import { static_random, pre_filled_2d_array } from "../util";
import { BruteForce, Solver } from "./algorithms";

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
        this.solver = new BruteForce();
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
        let passed = pre_filled_2d_array(this.game.getSize(), false);
        let perimeter: Space[] = [];
        let unsolved_spaces: Space[] = [];
        for (let x = 0; x < this.game.getSize(); x++) {
            for (let y = 0; y < this.game.getSize(); y++) {
                let space = this.game.getSpace(x, y);
                if (!space.revealed || space.getNumMines() === 0)
                    continue;

                let unsolved = false;
                this.game.getNeighbors(space.x, space.y).forEach(neighbor => {
                    if (!neighbor.revealed && !neighbor.flagged) {
                        if (!passed[neighbor.x][neighbor.y])
                            perimeter.push(neighbor);
                        unsolved =true;
                    }
                    passed[neighbor.x][neighbor.y] = true;
                });
                if (unsolved)
                    unsolved_spaces.push(space)
            }
        }
        perimeter.forEach(space => {
            this.game.getSpaceView(space.x, space.y).mask.classList.add("blue");
        });

        unsolved_spaces.forEach(space => {
            this.game.getSpaceView(space.x, space.y).revealed.classList.add("red");
        });
        console.log("Debug: End getInfo()")
        return {"perimeter": perimeter, "unsolved_spaces": unsolved_spaces};
    }

    public makeMove() {
        // this.testAI?.clear()
        let model = this.game.getModel();
        let {perimeter, unsolved_spaces} = this.getInfo();

        perimeter.forEach(space => {
            this.game.getSpaceView(space.x, space.y).mask.classList.remove("blue");
        });

        unsolved_spaces.forEach(space => {
            this.game.getSpaceView(space.x, space.y).revealed.classList.remove("red");
        });
        console.log("Debug: End makeMove()")
        // perimeter.forEach(space => this.game.getSpaceView(space.x, space.y).mask.textContent = (times_flagged[space.x][space.y] / valid_models.length * 100).toString())}
    }
}