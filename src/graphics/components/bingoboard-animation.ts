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
    tiles: Tile[][] = Array(5)
        .fill(null)
        .map(() => Array(5).fill({ row: 0, col: 0 }));
    sequenceIndex: number = 0;
    isRolling: boolean = false;
    currentX: number = 0;
    currentY: number = 0;
    col: number = 2;
    row: number = 2;
    isCubeVisible = false;
    rollTimeout: any = null;
    stopTimeout: any = null;
    rollStepTimeout: any = null;

    @Watch('boardHidden')
    onBoardHiddenChanged(newVal: boolean, oldVal: boolean) {
        if (!newVal && oldVal) {
            this.startAnimation();
        }
    }

    // Define the sequence of movements for the cube
    sequence = [
        { row: 2, col: 2 },
        { row: 3, col: 2 },
        { row: 3, col: 1 },
        { row: 2, col: 1 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 1, col: 3 },
        { row: 2, col: 3 },
        { row: 3, col: 3 },
        { row: 4, col: 3 },
        { row: 4, col: 2 },
        { row: 4, col: 1 },
        { row: 4, col: 0 },
        { row: 3, col: 0 },
        { row: 2, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
        { row: 0, col: 4 },
        { row: 1, col: 4 },
        { row: 2, col: 4 },
        { row: 3, col: 4 },
        { row: 4, col: 4 }
    ];

    mounted() {
        this.generateTilePositions();
        this.setupCubeDimensions();
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

        const startingTile = this.tiles[2][2];
        cube.style.transform = `translate(${startingTile.left}px, ${startingTile.top}px)`;
    }

    getNextTile() {
        this.sequenceIndex++;
        if (this.sequenceIndex < this.sequence.length) {
            const { col, row } = this.sequence[this.sequenceIndex];
            return this.tiles[row][col];
        }
        return null;
    }

    calculateTransitionDuration() {
        return (0.15 / (this.sequenceIndex + 1)) * 3;
    }

    rollStep() {
        if (this.isRolling) return;
        try {
            const tile = this.getNextTile();
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

            const currentTile = this.$refs.cells[this.row * 5 + this.col] as HTMLElement;
            currentTile.style.visibility = 'visible';

            this.col = this.sequence[this.sequenceIndex].col;
            this.row = this.sequence[this.sequenceIndex].row;

            const cube = this.$refs.cube as HTMLElement;
            const transitionDuration = this.calculateTransitionDuration();

            cube.style.transitionDuration = `${transitionDuration}s`;
            cube.style.transform = `translate(${tile.left}px, ${tile.top}px) rotateX(${this.currentX}deg) rotateY(${this.currentY}deg)`;

            this.isRolling = true;
            this.rollStepTimeout = setTimeout(() => {
                this.isRolling = false;
                cube.style.transitionDuration = '0.150s';
                this.rollStep();
            }, transitionDuration * 1000);
            currentTile.style.visibility = 'visible';
        } catch (error) {
            console.log('Error in rollStep:', error);
            clearTimeout(this.rollTimeout);
            clearTimeout(this.stopTimeout);
            clearTimeout(this.rollStepTimeout);
            this.stopAnimation();
        }
    }

    generateTilePositions() {
        const bingoBoardRect = this.$el.getBoundingClientRect();
        const cells = this.$refs.cells as HTMLElement[];

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const cell = cells[row * 5 + col];
                const rect = cell.getBoundingClientRect();
                this.tiles[row][col] = {
                    row: row,
                    col: col,
                    width: rect.width,
                    height: rect.height,
                    left: rect.left - bingoBoardRect.left,
                    top: rect.top - bingoBoardRect.top
                };
            }
        }
    }

    hideTiles() {
        const tiles = this.$refs.cells as HTMLElement[];
        tiles.forEach((tile) => {
            tile.style.visibility = 'hidden';
            tile.style.border = '2px solid transparent';
        });
        return new Promise<void>((resolve) => {
            setTimeout(resolve, 1000);
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

        return new Promise<void>((resolve) => {
            setTimeout(resolve, 10);
        });
    }

    delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    startAnimation() {
        clearTimeout(this.rollTimeout);
        clearTimeout(this.stopTimeout);
        clearTimeout(this.rollStepTimeout);
        this.hideTiles().then(() => {
            this.showTilesBorder().then(() => {
                const cube = this.$refs.cube as HTMLElement;
                cube.style.display = 'block';
                this.initializeAnimationState();

                this.rollTimeout = setTimeout(() => this.rollStep(), 900);
                this.stopTimeout = setTimeout(() => this.stopAnimation(), 2500);
            });
        });
    }

    initializeAnimationState() {
        this.isCubeVisible = true;
        this.isRolling = false;
        this.sequenceIndex = 0;

        const firstTile = this.$refs.cells[2 * 5 + 2] as HTMLElement;
        firstTile.style.visibility = 'visible';
    }

    stopAnimation() {
        this.isRolling = true; // Stop the rollStep loop

        const cube = this.$refs.cube as HTMLElement;

        // Get the middle tile using the 2D array
        const startingTile = this.tiles[2][2];
        cube.style.transform = `translate(${startingTile.left}px, ${startingTile.top}px)`;
        cube.style.display = 'none';

        // Reveal the last tile in the sequence
        const lastSequenceTile = this.sequence[this.sequence.length - 1];
        const lastTile = this.$refs.cells[lastSequenceTile.row * 5 + lastSequenceTile.col] as HTMLElement;
        lastTile.style.visibility = 'visible';
    }
}
