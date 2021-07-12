import { Model } from "../model/model";
import { Space } from "../model/space";
import { pre_filled_2d_array } from "../util";
export class Result {
    public safe_spaces: { x: number; y: number; }[] = [];
    public mines: { x: number; y: number; }[] = [];
}
export interface Solver {
    isValid: (model: Model, unsolved_spaces: Space[]) => boolean,
    solve: (model: Model, perimeter: Space[], unsolved_spaces: Space[]) => Result
}

export class BruteForce implements Solver {
    public isValid(model: Model, unsolved_spaces: Space[]) {
        if (model.getFlags() > model.numMines)
            return false;
        for (let space of unsolved_spaces) {
            if (model.getNumFlags(space.x, space.y) !== space.getNumMines())
                return false;
        }
        return true;
    }
    public solve(model: Model, perimeter: Space[], unsolved_spaces: Space[]) {
        console.log(`Debug: Start makeMove() processing ${Math.pow(2, perimeter.length)} possible combinations`);
        let valid_models: Model[] = [];
        let times_flagged = pre_filled_2d_array(model.size, 0);

        for (let i = 0; i < Math.pow(2, perimeter.length); i++) {
            let test_model = model.clone()
            for (let j = 0; j < perimeter.length; j++) {
                test_model.setFlag(perimeter[j].x, perimeter[j].y, !!((i >> j) & 1));
            }
            if (this.isValid(test_model, unsolved_spaces)) {
                valid_models.push(test_model);
                // this.testAI?.add(test_model);
                perimeter.forEach(space => times_flagged[space.x][space.y] += test_model.getSpace(space.x, space.y).flagged ? 1 : 0);
            }
            // console.log(result.join(", "))
        }
        let result = new Result()
        perimeter.forEach(space => {
            // console.log(`(${space.x}, ${space.y}) flagged ${times_flagged[space.x][space.y]} times out of ${valid_models.length}`)
            if (times_flagged[space.x][space.y] / valid_models.length === 1) {
                result.mines.push({ x: space.x, y: space.y })
            } else if (times_flagged[space.x][space.y] / valid_models.length === 0) {
                result.safe_spaces.push({ x: space.x, y: space.y })
            }
        });
        return result;
    }
}

export class Backtrack implements Solver {
    public isValid(model: Model, unsolved_spaces: Space[]) {
        return false;
    }
    
    public solve (model: Model, perimeter: Space[], unsolved_spaces: Space[]) {
        return new Result();
    };

}