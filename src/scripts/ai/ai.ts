import { Game } from "../game";
import { Model } from "../model/model";
import { Space } from "../model/space";
import { TestAI } from "../test/testAI";
import { static_random } from "../util";
import { Backtrack, BruteForce, Solver } from "./algorithms";
import { ComputedSpace } from "./computed_space";

export class AIInfoResult {
    public perimeter: Space[] = [];
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
        this.makeFirstClick();
        document.querySelector("#make_move")?.addEventListener("click", event => {
            console.log("Debug: AI making move");
            this.makeMove()
            this.getInfo()
        });
        document.querySelector("#get_info")?.addEventListener("click", event => {
            this.getInfo()
        });
        this.solver = new Backtrack.Backtrack();
        // this.solver = new BruteForce();
    }

    makeFirstClick() {
        const x = Math.round(static_random() * (this.game.getWidth() - 1));
        const y = Math.round(static_random() * (this.game.getHeight() - 1));
        console.log(`Debug: AI making random first move (${x}, ${y})`)
        // this.game.getSpaceView(x, y).revealed.classList.add("yellow");

        this.game.handleLeftClick(x, y);
    }

    buildInfo(result: AIInfoResult, space: Space, already_seen: Map<Space, boolean>) {
        let unsolved = false;
        // this.testAI?.addColor(space, "yellow");
        let computed_space = new ComputedSpace(space);
        let unsolved_neighbors = [];
        already_seen.set(space, true);

        for (let neighbor of this.game.getNeighbors(computed_space.getX(), computed_space.getY())) {
            if (neighbor.flagged) {
                computed_space.max--;
                continue;
            }
            if (!neighbor.revealed) {
                let index = result.perimeter.indexOf(neighbor);
                if (index === -1) index = result.perimeter.push(neighbor) - 1;
                computed_space.addIndex(index);
                unsolved = true;
                this.game.getSpaceView(space.x, space.y);
                continue;
            }

            if (neighbor.getNumMines() !== 0 && !already_seen.has(neighbor)) {
                unsolved_neighbors.push(neighbor);
            }
        }
        if (unsolved) {
            result.computed_spaces.push(computed_space);
            unsolved_neighbors.forEach(neighbor => this.buildInfo(result, neighbor, already_seen));
        }
    }

    getInfo() {
        console.log("Debug: Start getInfo()")
        let results: AIInfoResult[] = [];
        let already_seen: Map<Space, boolean> = new Map();
        
        for (let x = 0; x < this.game.getWidth(); x++) {
            for (let y = 0; y < this.game.getHeight(); y++) {
                let space = this.game.getSpace(x, y);
                if (space.revealed && space.getNumMines() > 0 && !already_seen.has(space)) {
                   let result = new AIInfoResult();
                   this.buildInfo(result, space, already_seen);
                   if (result.computed_spaces.length > 0) results.push(result);
                }
            }
        }
        results[0].perimeter.forEach(space => {
            this.testAI?.addColor(space, "blue");
        });

        results[0].computed_spaces.forEach(space => {
            this.testAI?.addColor(space, "red");
        });

        console.log(results);
        console.log(`${results.length} results`);
        console.log("Debug: End getInfo()")
        return results;
    }

    public makeMove() {
        // this.testAI?.clear()
        let model = this.game.getModel();
        let infos = this.getInfo();

        console.log("Debug: Start makeMove()")
        for (let info of infos) {
            let result = this.solver.solve(info);

            result.mines.forEach(space => this.game.handleRightClick(space.x, space.y));
            result.safe_spaces.forEach(space => this.game.handleLeftClick(space.x, space.y));
            console.log("Debug: End makeMove()")
            this.testAI?.clearColors();
        }
        // perimeter.forEach(space => this.game.getSpaceView(space.x, space.y).mask.textContent = (times_flagged[space.x][space.y] / valid_models.length * 100).toString())}
    }
}