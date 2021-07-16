import { Model } from "../model/model";
import { Space } from "../model/space";
import { pre_filled_2d_array, replaceAt } from "../util";
import { AIInfoResult } from "./ai";
import { ComputedSpace, ComputedSpaceResult } from "./computed_space";
export class Result {
    public safe_spaces: { x: number; y: number; }[] = [];
    public mines: { x: number; y: number; }[] = [];
}
export interface Solver {
    solve: (model: Model, info: AIInfoResult) => Result
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
    public solve(model: Model, info: AIInfoResult) {
        let {perimeter, unsolved_spaces} = info;
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
                perimeter.forEach(space => times_flagged[space.x][space.y] += test_model.getSpace(space.x, space.y).flagged ? 1 : 0);
            }
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

export namespace Backtrack {
    export class Node {
        private data: number[];
        
        constructor (data: number[]) {
            this.data = data;
        }
        
        public children(): Node[] {
            let result = [];
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i] === 0) {
                    result.push(new Node(replaceAt(this.data, i, 1)));
                    continue;
                }
            }
            return result;
        }

        public isValid(spaces: ComputedSpace[]) {
            for (let space of spaces) {
                let validity = space.isValid(this.data);
                console.log(`(${space.getX()}, ${space.getY()}) is ${validity}`)
                if (validity !== ComputedSpaceResult.Valid)
                    return validity;
            }
            return ComputedSpaceResult.Valid;
        }
    }
    export class Backtrack implements Solver {
    
        public backtrack(node: Node, spaces: ComputedSpace[]): boolean {
            let isValid = node.isValid(spaces);
            switch (isValid) {
                case ComputedSpaceResult.Valid:
                    console.log(node);
                    return true;
                case ComputedSpaceResult.Invalid:
                    return false;
                case ComputedSpaceResult.Incomplete:
                    for (let child of node.children()) {
                        if (this.backtrack(child, spaces)) return true;
                    }
            }
            return false;
        }
        
        public solve (model: Model, info: AIInfoResult) {
            let data = info.perimeter.map(n => 0);
            this.backtrack(new Node(data), info.computed_spaces);
            return new Result();
        };
    }

}