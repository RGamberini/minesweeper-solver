import { Game } from "./game"
import { Model } from "./Model/model";
import { Space } from "./Model/space";
import { TestAI } from "./test/testAI";
import { pre_filled_2d_array, pre_filled_array, static_random } from "./util";
export class AI {
    private game: Game;
    private testing: boolean = true;
    private testAI?: TestAI;

    constructor(game: Game) {
        this.game = game
        if (this.testing) this.testAI = new TestAI();
        this.makeFistClick();
        // let info = this.getInfo();
        // console.log(this.isValid(game.getModel(), info.unsolved_spaces));
        // this.makeMove()
    }

    makeFistClick() {
        const x = Math.round(static_random() * (this.game.getSize() - 1));
        const y = Math.round(static_random() * (this.game.getSize() - 1));
        console.log(`Debug: AI clicking (${x}, ${y})`)
        this.game.getSpaceView(x, y).revealed.classList.add("yellow");

        this.game.handleLeftClick(x, y);
    }

    isValid(model: Model, unsolved_spaces: Space[]): boolean {
        if (model.getFlags() > model.numMines)
            return false;
        for (let space of unsolved_spaces) {
            if (model.getNumFlags(space.x, space.y) !== space.getNumMines())
                return false;
        }
        return true;
    }

    getInfo() {
        let passed = pre_filled_2d_array(this.game.getSize(), false);
        let perimeter: Space[] = [];
        let unsolved_spaces: Space[] = [];
        for (let x = 0; x < this.game.getSize(); x++) {
            for (let y = 0; y < this.game.getSize(); y++) {
                let space = this.game.getSpace(x, y);
                if (!space.revealed || space.getNumMines() === 0)
                    continue;
                unsolved_spaces.push(space)

                this.game.getNeighbors(space.x, space.y).forEach(neighbor => {
                    if (!passed[neighbor.x][neighbor.y] && !neighbor.revealed)
                        perimeter.push(neighbor);
                    passed[neighbor.x][neighbor.y] = true;
                });
            }
        }
        perimeter.forEach(space => {
            this.game.getSpaceView(space.x, space.y).mask.classList.add("blue");
        });

        unsolved_spaces.forEach(space => {
            this.game.getSpaceView(space.x, space.y).revealed.classList.add("red");
        });
        return {"perimeter": perimeter, "unsolved_spaces": unsolved_spaces};
    }

    makeMove() {
        let model = this.game.getModel();
        let {perimeter, unsolved_spaces} = this.getInfo();
        let valid_models: Model[] = [];
        let times_flagged = pre_filled_2d_array(this.game.getSize(), 0);

        for (let i = 0; i < Math.pow(2, perimeter.length); i++) {
            let test_model = new Model(model.size, model.numMines, model);
            for (let j = 0; j < perimeter.length; j++) {
                test_model.setFlag(perimeter[j].x, perimeter[j].y, !!((i >> j) & 1));
            }
            if (this.isValid(test_model, unsolved_spaces)) {
                valid_models.push(test_model);
                this.testAI?.add(test_model);
                perimeter.forEach(space => times_flagged[space.x][space.y]++)
            }
            // console.log(result.join(", "))
        }
        // perimeter.forEach(space => this.game.getSpaceView(space.x, space.y).mask.textContent = (times_flagged[space.x][space.y] / valid_models.length).toFixed(2))
    }
}