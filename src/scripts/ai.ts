import {Game} from "./game"
export class AI {
    private game: Game;

    constructor(game: Game) {
        this.game = game
        Math.random()
        game.handleLeftClick(Math.round(Math.random() * (this.game.getSize() - 1)), Math.round(Math.random() * (this.game.getSize() - 1)));
        this.getPerimeter();
    }

    isValid(model: Model, perimeter: Space[]): boolean {
        if (model.getFlags() > model.numMines)
            return false;
        perimeter.forEach(space => {
            if (model.getNumFlags(space.x, space.y) > space.getNumMines())
                return false;
        });
        return true;
    }

    getPerimeter(): Space[] {
        let passed: boolean[][] = Array.from({ length: this.game.getSize() }, () => 
            Array.from({ length: this.game.getSize() }, () => false)
        );
        let perimeter: Space[] = [];
        for(let x = 0; x < this.game.getSize(); x++) {
            for(let y = 0; y < this.game.getSize(); y++) {
                let space = this.game.getSpace(x, y);
                if (!space.revealed || space.getNumMines() === 0)
                    continue;

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
        return perimeter;
    }

    makeMove() {
        let model = this.game.getModel();
        let perimeter = this.getPerimeter();

        for (let i = 0; i < Math.pow(2, perimeter.length); i++) {
            let test_model = new Model(model.size, model.numMines, model)
            for (let j = 0; j < perimeter.length; j++) {
                test_model.setFlag(perimeter[j].x, perimeter[j].y, !!((i >> j) & 1));
            }
            
            // console.log(result.join(", "))
        }
    }
}