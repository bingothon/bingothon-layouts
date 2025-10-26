import { Vue, Component, Watch } from 'vue-property-decorator';

type Tile = {
    row: number;
    col: number;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
};

@Component
export class BingoBoardAnimation extends Vue {
    tiles: Tile[][] = [];
    currentX: number = 0;
    currentY: number = 0;
    col: number = 2;
    row: number = 2;
    isCubeVisible = false;

    columnCount: number = 5;
    rowCount: number = 5;

    @Watch('boardHidden')
    onBoardHiddenChanged(newVal: boolean, oldVal: boolean) {
        if (!newVal && oldVal) {
            this.generateTilePositions();
            this.setupSequence();
            this.setupCubeDimensions();
            this.startAnimation();
        }
    }

    // Define the sequence of movements for the cube
    sequence: {row: number, col: number, direction: number }[] = [];

    setupSequence() {
        // we start in the bottom right corner, go up and then always follow the wall until we visited every tile
        function move(col: number, row: number, direction: number): [number, number] {
            switch(direction) {
                case 0: return [col, row - 1];
                case 1: return [col - 1, row];
                case 2: return [col, row + 1];
                default: return [col + 1, row];
            }
        }
        const pool = new Set(Array(this.rowCount).fill(null).flatMap((_, row) =>
            Array(this.columnCount).fill(null).map((_, col) => `${row}-${col}`)));
        let currentRow = this.rowCount;
        let currentCol = this.columnCount - 1;
        let direction = 0;
        const seq = [];
        for (let i = 0; i < this.rowCount * this.columnCount; i++) {
            // try to move, if it doesn't work, turn
            let [nextCol, nextRow] = move(currentCol, currentRow, direction);
            if (!pool.has(`${nextRow}-${nextCol}`)) {
                direction = (direction + 1) % 4;
                [nextCol, nextRow] = move(currentCol, currentRow, direction);
            }
            currentRow = nextRow;
            currentCol = nextCol;
            seq.push({row: currentRow, col: currentCol, direction, });
            pool.delete(`${currentRow}-${currentCol}`);
        }
        this.sequence = seq.reverse();
    }

    setupCubeDimensions() {
        const tileSize = this.tiles[0][0];
        const cube = this.$refs.cube as HTMLElement;
        cube.style.width = `${tileSize.width}px`;
        cube.style.height = `${tileSize.height}px`;
        cube.style.transformOrigin = `${tileSize.width / 2}px ${tileSize.height / 2}px`;

        const faces = cube.querySelectorAll('.face') as NodeListOf<HTMLElement>;
        faces.forEach((face) => {
            face.style.width = `${tileSize.width}px`;
            face.style.height = `${tileSize.height}px`;
        });

        const startingTile = this.tiles[this.sequence[0].row][this.sequence[0].col];
        cube.style.transform = `translate(${startingTile.left}px, ${startingTile.top}px)`;
    }

    calculateTransitionDuration(sequenceIndex: number) {
        return (0.15 / (sequenceIndex + 1)) * 3;
    }

    async doRolling() {
        try {
            for(let i = 0; i < this.sequence.length; i++) {
                const { col, row } = this.sequence[i];
                const tile = this.tiles[row][col];
                if (!tile) return;

                // Compute your transformation...
                if (tile.col > this.tiles[this.row][this.col].col) {
                    this.currentY += 90;
                } else if (tile.col < this.tiles[this.row][this.col].col) {
                    this.currentY -= 90;
                } else if (tile.row > this.tiles[this.row][this.col].row) {
                    this.currentX -= 90;
                } else if (tile.row < this.tiles[this.row][this.col].row) {
                    this.currentX += 90;
                }

                const currentTile = this.$refs.cells[this.row * this.columnCount + this.col] as HTMLElement;
                currentTile.style.visibility = 'visible';

                this.col = col;
                this.row = row;

                const cube = this.$refs.cube as HTMLElement;
                const transitionDuration = this.calculateTransitionDuration(i);

                cube.style.transitionDuration = `${transitionDuration}s`;
                cube.style.transform = `translate(${tile.left}px, ${tile.top}px) rotateX(${this.currentX}deg) rotateY(${this.currentY}deg)`;

                currentTile.style.visibility = 'visible';
                await this.delay(transitionDuration * 1000);
            }
        } catch (error) {
            console.log('Error in rollStep:', error);
        } finally {
            this.stopAnimation();
        }
    }

    generateTilePositions() {
        const bingoBoardRect = this.$el.getBoundingClientRect();
        const cells = this.$refs.cells as HTMLElement[];

        this.tiles = Array(this.rowCount).fill(null).map((_, row) =>
            Array(this.columnCount).fill(null).map((_, col) => {
                const cell = cells[row * this.columnCount + col];
                const rect = cell.getBoundingClientRect();
                return {
                    row: row,
                    col: col,
                    width: rect.width,
                    height: rect.height,
                    left: rect.left - bingoBoardRect.left,
                    top: rect.top - bingoBoardRect.top
                };
            })
        )
    }

    hideTiles() {
        const tiles = this.$refs.cells as HTMLElement[];
        tiles.forEach((tile) => {
            tile.style.visibility = 'hidden';
            tile.style.border = '2px solid transparent';
        });
    }

    showTilesBorder() {
        const tiles = this.$refs.cells as HTMLElement[];
        tiles.forEach((tile) => {
            tile.style.transition = 'border-color 0.5s ease-in-out';
            tile.style.border = '2px solid transparent';
            setTimeout(() => {
                tile.style.borderColor = 'black';
            }, 10); // A short delay to ensure the border color transition takes effect after the border width is applied
        });
    }

    delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async startAnimation() {
        this.hideTiles();
        await this.delay(1000);
        this.showTilesBorder()
        await this.delay(10);
        this.isCubeVisible = true;
        this.initializeAnimationState();
        await this.doRolling();
    }

    initializeAnimationState() {
        this.currentX = 0;
        this.currentY = 0;
        const { col, row } = this.sequence[0];
        this.col = col;
        this.row = row;
        // const firstTile = this.$refs.cells[col * this.rowCount + row] as HTMLElement;
        // firstTile.style.visibility = 'visible';
    }

    stopAnimation() {
        this.isCubeVisible = false;
        const cube = this.$refs.cube as HTMLElement;

        // Reveal all tiles
        (this.$refs.cells as HTMLElement[]).forEach(cell => cell.style.visibility = 'visible');
    }
}
