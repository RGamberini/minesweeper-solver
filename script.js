"use strict";
function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
Math.random = mulberry32(2);
function shuffle(array) {
    var currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}
class Space {
    constructor(x, y, mine, numMines) {
        this.x = x;
        this.y = y;
        this.mine = mine;
        this.numMines = numMines;
        this.revealed = false;
        this.flagged = false;
    }
    getNumMines() {
        return this.numMines;
    }
}
class Model {
    constructor(size, numMines, grid) {
        this.size = size;
        this.numMines = numMines;
        if (!grid) {
            this.grid = [];
            this.buildGrid();
        }
        else
            this.grid = grid;
    }
    getMines(mines, x, y) {
        let index = (x * this.size) + y;
        if (mines[index])
            return 0;
        return Model.directions
            .map(direction => {
            return { x: x + direction[0], y: y + direction[1] };
        })
            .filter(neighbor_coord => this.inBounds(neighbor_coord.x, neighbor_coord.y))
            .map(neighbor_cord => mines[(neighbor_cord.x * this.size) + neighbor_cord.y])
            .reduce((sum, n) => sum + (n ? 1 : 0), 0);
    }
    buildGrid() {
        let mines = shuffle(Array.from({ length: (this.size * this.size) - this.numMines }, n => n = false).concat(Array.from({ length: this.numMines }, n => n = true)));
        window.mines = mines;
        for (let x = 0; x < this.size; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.size; y++) {
                this.grid[x][y] = new Space(x, y, mines[(x * this.size) + y], this.getMines(mines, x, y));
            }
        }
    }
    inBounds(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
    getSpace(x, y) {
        return this.grid[x][y];
    }
    getNeighbors(x, y) {
        return Model.directions
            .filter(direction => this.inBounds(x + direction[0], y + direction[1]))
            .map(direction => this.getSpace(x + direction[0], y + direction[1]));
    }
}
Model.directions = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];
class SpaceView {
    constructor(container) {
        this.container = container;
        this.createContents();
    }
    createContents() {
        this.revealed = document.createElement("div");
        this.revealed.setAttribute("class", "space revealed");
        this.container.appendChild(this.revealed);
        this.mask = document.createElement("div");
        this.mask.setAttribute("class", "space mask");
        this.container.appendChild(this.mask);
        this.flag = document.createElement("img");
        this.flag.setAttribute("src", "flag.png");
        this.flag.classList.add("flag");
        this.flag.classList.add("hide");
        this.mask.appendChild(this.flag);
    }
    update(space) {
        this.setRevealed(space.revealed);
        this.setNumMines(space.getNumMines());
        this.updateFlag(space.flagged);
    }
    setRevealed(revealed) {
        if (revealed)
            this.mask.classList.add("hide");
        else
            this.mask.classList.remove("hide");
    }
    setNumMines(numMines) {
        this.revealed.innerHTML = `<p>${numMines === 0 ? "" : numMines.toString()}</p>`;
        this.revealed.setAttribute("style", `color: ${SpaceView.colors[numMines - 1]}`);
    }
    showBomb() {
        let bomb = document.createElement("img");
        bomb.setAttribute("src", "bomb-solid.svg");
        this.mask.appendChild(bomb);
    }
    updateFlag(flagged) {
        if (flagged)
            this.flag.classList.remove("hide");
        else
            this.flag.classList.add("hide");
    }
}
SpaceView.colors = ["#0200FD", "#017E00", "#FE0001", "#01017E", "#830003", "#008080", "#000000", "#808080"];
class View {
    constructor(model, container) {
        this.container = container;
        this.model = model;
        this.spaces = [];
        for (let x = 0; x < model.size; x++) {
            this.spaces[x] = [];
            let row = document.createElement("div");
            row.setAttribute("class", "column");
            this.container.appendChild(row);
            for (let y = 0; y < model.size; y++) {
                let space = document.createElement("div");
                space.setAttribute("class", "space");
                space.setAttribute("x", x.toString());
                space.setAttribute("y", y.toString());
                row.appendChild(space);
                this.spaces[x][y] = new SpaceView(space);
                this.spaces[x][y].update(model.getSpace(x, y));
            }
        }
    }
    update(newModel) {
        if (newModel)
            this.model = newModel;
        for (let x = 0; x < this.model.size; x++) {
            for (let y = 0; y < this.model.size; y++) {
                this.spaces[x][y].update(this.model.getSpace(x, y));
            }
        }
    }
    getSpace(x, y) {
        return this.spaces[x][y];
    }
    getSize() {
        return this.model.size;
    }
    getNeighbors(x, y) {
        return this.model.getNeighbors(x, y).map(space => this.getSpace(space.x, space.y));
    }
    showBombs() {
        for (let x = 0; x < this.model.size; x++) {
            for (let y = 0; y < this.model.size; y++) {
                if (this.model.getSpace(x, y).mine && !this.model.getSpace(x, y).flagged)
                    this.spaces[x][y].showBomb();
            }
        }
    }
}
class Controller {
    constructor(view, game) {
        this.leftButtonDown = false;
        this.rightButtonDown = false;
        this.view = view;
        this.game = game;
        let currentElement = document.createElement("null");
        view.container.addEventListener("mousedown", (e) => {
            let space = e.target;
            currentElement = space;
            e.preventDefault();
            if (e.button === 0)
                this.leftButtonDown = true;
            if (e.button === 2)
                this.rightButtonDown = true;
            if (this.leftButtonDown && this.rightButtonDown)
                this.handleDoublePress(currentElement);
            else if (this.leftButtonDown)
                this.handleLeftPress(currentElement);
        });
        view.container.addEventListener("mousemove", (e) => {
            let space = e.target;
            if (currentElement === space)
                return;
            if (this.leftButtonDown && this.rightButtonDown) {
                currentElement.classList.remove("pushed");
                let parentElement = currentElement.parentElement;
                if (!parentElement)
                    return;
                let x = parseInt(parentElement.getAttribute("x"));
                let y = parseInt(parentElement.getAttribute("y"));
                this.view.getNeighbors(x, y).forEach(viewSpace => viewSpace.mask.classList.remove("pushed"));
                this.handleDoublePress(space);
            }
            else if (this.leftButtonDown) {
                currentElement.classList.remove("pushed");
                if (space.classList.contains("mask"))
                    space.classList.add("pushed");
            }
            currentElement = space;
        });
        view.container.addEventListener("mouseup", (e) => {
            if (this.leftButtonDown && this.rightButtonDown)
                this.handleDoubleRelease(currentElement);
            else if (this.leftButtonDown)
                this.handleLeftRelease(currentElement);
            else if (this.rightButtonDown)
                this.handleRightRelease(currentElement);
            if (e.button === 0)
                this.leftButtonDown = false;
            if (e.button === 2)
                this.rightButtonDown = false;
        });
        view.container.addEventListener("contextmenu", e => e.preventDefault());
    }
    handleLeftPress(currentElement) {
        if (currentElement.classList.contains("mask"))
            currentElement.classList.add("pushed");
    }
    handleDoublePress(currentElement) {
        if (currentElement.classList.contains("mask"))
            currentElement.classList.add("pushed");
        let parentElement = currentElement.parentElement;
        if (!parentElement)
            return;
        let x = parseInt(parentElement.getAttribute("x"));
        let y = parseInt(parentElement.getAttribute("y"));
        this.view.getNeighbors(x, y).forEach(neighbor => {
            if (!neighbor.mask.classList.contains("hide") && neighbor.mask.querySelector(".flag:not(.hide)") === null)
                neighbor.mask.classList.add("pushed");
        });
    }
    handleLeftRelease(currentElement) {
        currentElement.classList.remove("pushed");
        let parentElement = currentElement.parentElement;
        if (!parentElement)
            return;
        let x = parseInt(parentElement.getAttribute("x"));
        let y = parseInt(parentElement.getAttribute("y"));
        this.game.handleLeftClick(x, y);
    }
    handleRightRelease(currentElement) {
        let parentElement = currentElement.parentElement;
        if (!parentElement)
            return;
        let x = parseInt(parentElement.getAttribute("x"));
        let y = parseInt(parentElement.getAttribute("y"));
        this.game.handleRightClick(x, y);
    }
    handleDoubleRelease(currentElement) {
        currentElement.classList.remove("pushed");
        let parentElement = currentElement.parentElement;
        if (!parentElement)
            return;
        this.leftButtonDown = false;
        this.rightButtonDown = false;
        let x = parseInt(parentElement.getAttribute("x"));
        let y = parseInt(parentElement.getAttribute("y"));
        this.view.getNeighbors(x, y).forEach(viewSpace => viewSpace.mask.classList.remove("pushed"));
        this.game.handleDoubleClick(x, y);
    }
}
class AI {
    constructor(game) {
        this.game = game;
        Math.random();
        game.handleLeftClick(Math.round(Math.random() * (this.game.getSize() - 1)), Math.round(Math.random() * (this.game.getSize() - 1)));
        this.getPerimeter();
    }
    getPerimeter() {
        let passed = Array.from({ length: this.game.getSize() }, () => Array.from({ length: this.game.getSize() }, () => false));
        let perimeter = [];
        for (let x = 0; x < this.game.getSize(); x++) {
            for (let y = 0; y < this.game.getSize(); y++) {
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
    }
}
class Game {
    constructor(model, view) {
        this.view = view;
        this.model = model;
        this.firstClick = true;
    }
    handleLeftClick(x, y) {
        let space = this.model.getSpace(x, y);
        if ((space.getNumMines() !== 0 || space.mine) && this.firstClick) {
            console.log("FIRST CLICK MAKING NEW BOARD");
            while (space.getNumMines() !== 0 || space.mine) {
                this.model = new Model(this.model.size, this.model.numMines);
                space = this.model.getSpace(x, y);
            }
            this.view.update(this.model);
            this.firstClick = false;
        }
        if (space.revealed)
            return;
        if (space.mine) {
            this.view.showBombs();
            return;
        }
        this.reveal(space);
        this.view.update();
        this.firstClick = false;
    }
    handleRightClick(x, y) {
        let space = this.model.getSpace(x, y);
        if (space.revealed)
            return;
        space.flagged = !space.flagged;
        this.view.update();
    }
    handleDoubleClick(x, y) {
        let space = this.model.getSpace(x, y);
        if (!space.revealed)
            return;
        let numFlags = this.model.getNeighbors(x, y).reduce((sum, neighbor) => sum + (neighbor.flagged ? 1 : 0), 0);
        if (numFlags === space.getNumMines()) {
            this.model.getNeighbors(x, y)
                .filter(neighbor => !neighbor.flagged)
                .forEach(neighbor => this.handleLeftClick(neighbor.x, neighbor.y));
        }
    }
    reveal(space) {
        if (space.revealed)
            return;
        if (space.mine)
            return;
        space.revealed = true;
        if (space.getNumMines() === 0) {
            this.model.getNeighbors(space.x, space.y).forEach(neighbor => this.reveal(neighbor));
        }
    }
    getModel() {
        return this.model;
    }
    getSize() {
        return this.model.size;
    }
    getSpace(x, y) {
        return this.model.getSpace(x, y);
    }
    getSpaceView(x, y) {
        return this.view.getSpace(x, y);
    }
    getNeighbors(x, y) {
        return this.model.getNeighbors(x, y);
    }
}
const container = document.querySelector(".container");
if (container !== null) {
    const model = new Model(4, 5);
    const view = new View(model, container);
    const game = new Game(model, view);
    const controller = new Controller(view, game);
    const ai = new AI(game);
}
