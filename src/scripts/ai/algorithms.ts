import { Model } from "../model/model";
import { Space } from "../model/space";
import { pre_filled_2d_array, pre_filled_array, replaceAt } from "../util";
import { AIInfoResult } from "./ai";
import { ComputedSpace, ComputedSpaceResult } from "./computed_space";
export class Result {
    public safe_spaces: { x: number; y: number; }[] = [];
    public mines: { x: number; y: number; }[] = [];
}
export interface Solver {
    solve: (info: AIInfoResult) => Result
}

export class BruteForce implements Solver {
    private isValid(computed_spaces: ComputedSpace[], data: number[]) {
        for (let space of computed_spaces) {
            if (space.isValid(data) !== ComputedSpaceResult.Valid)
                return false;
        }
        return true;
    }
    public solve(info: AIInfoResult) {
        let {perimeter, computed_spaces} = info;
        let data = info.perimeter.map(n => 0);
        console.log(`Debug: Start makeMove() processing ${Math.pow(2, perimeter.length)} possible combinations`);
        let times_flagged = info.perimeter.map(n => 0);
        let num_valid = 0;

        for (let i = 0; i < Math.pow(2, perimeter.length); i++) {
            for (let j = 0; j < perimeter.length; j++) {
                data[j] = (i >> j) & 1;
            }
            if (this.isValid(computed_spaces, data)) {
                num_valid++;
                for (let k = 0; k < perimeter.length; k++) {
                    if (data[k] === 1) times_flagged[k]++;
                }
            }
        }
        let result = new Result()
        for (let i = 0; i < perimeter.length; i++) {
            if (times_flagged[i] / num_valid === 1) {
                result.mines.push({ x: perimeter[i].x, y: perimeter[i].y })
            } else if (times_flagged[i] / num_valid === 0) {
                result.safe_spaces.push({ x: perimeter[i].x, y: perimeter[i].y })
            }
        }
        return result;
    }
}

export namespace Backtrack {
    class Node {
        private data: number[];
        private child_index: number;
        
        constructor (data: number[], child_index: number) {
            this.data = data;
            this.child_index = child_index;
        }
        
        public children(): Node[] {
            let result = [];
            for (let i = this.child_index; i < this.data.length; i++) {
                if (this.data[i] === 0) {
                    result.push(new Node(replaceAt(this.data, i, 1), i + 1));
                    continue;
                }
            }
            return result;
        }

        public isValid(spaces: ComputedSpace[]) {
            for (let space of spaces) {
                let validity = space.isValid(this.data);
                // console.log(`(${space.getX()}, ${space.getY()}) is ${validity}`)
                if (validity !== ComputedSpaceResult.Valid)
                    return validity;
            }
            return ComputedSpaceResult.Valid;
        }

        public getData() {
            return this.data;
        }
    }

    class Tree {
        public solutions: Node[] = [];

        public backtrack(node: Node, spaces: ComputedSpace[]): boolean {
            let isValid = node.isValid(spaces);
            switch (isValid) {
                case ComputedSpaceResult.Valid:
                    this.solutions.push(node);
                    return true;
                case ComputedSpaceResult.Invalid:
                    return false;
                case ComputedSpaceResult.Incomplete:
                    for (let child of node.children()) {
                        // if (this.backtrack(child, spaces)) return true;
                        this.backtrack(child, spaces);
                    }
            }
            return false;
        }

        public crush_solutions() {
            let solutions = this.solutions.map(solution => solution.getData());
            let result = pre_filled_array(solutions[0].length, 0)
            for (let i = 0; i < solutions[0].length; i++) {
                for (let solution of solutions) result[i] += solution[i]
            }
            return result;
        }
    }
    
    export class Backtrack implements Solver {
        
        public solve (info: AIInfoResult) {
            let result = new Result();
            let data = info.perimeter.map(n => 0);
            let root = new Node(data, 0);
            let tree = new Tree();

            tree.backtrack(root, info.computed_spaces);
            console.log(`${tree.solutions.length} possible solutions`);
            let solution = tree.crush_solutions();

            for (let i = 0; i < solution.length; i++) {
                if (solution[i] === tree.solutions.length)
                    result.mines.push({x: info.perimeter[i].x, y: info.perimeter[i].y})
                if (solution[i] === 0)
                    result.safe_spaces.push({x: info.perimeter[i].x, y: info.perimeter[i].y})
            }
            return result;
        };
    }

}