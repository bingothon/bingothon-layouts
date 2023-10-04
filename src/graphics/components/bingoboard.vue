<template>
    <div class="BingoBoard">
        <table class="bingo-table">
            <tbody>
                <tr :key="i" v-for="(column, i) in bingoCells">
                    <td
                        class="square"
                        :id="'tile-' + i + '-' + j"
                        :key="i + '' + j"
                        v-for="(cell, j) in column"
                        ref="cells"
                    >
                        <div
                            :key="color.color"
                            v-for="color in cell.colors"
                            :class="'bg-color ' + color.color + 'square'"
                            :style="color.style"
                        />
                        <div class="shadow" />
                        <div :class="getMarkerClasses(marker, k)" :key="k" v-for="(marker, k) in cell.markers" />
                        <div class="CellTextFitContainer">
                            <CellTextFit :text="cell.name" :fontSize="fontSize"></CellTextFit>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="bingo-board-hide" :hidden="!boardHidden">
            <p id="soon">Bingo Board will be revealed soon&trade;</p>
        </div>
        <!-- 3D Cube Structure -->
        <div ref="cube" class="cube" id="cube" :v-show="isCubeVisible">
            <div :v-show="isCubeVisible" class="face front">B</div>
            <div :v-show="isCubeVisible" class="face back">I</div>
            <div :v-show="isCubeVisible" class="face left">N</div>
            <div :v-show="isCubeVisible" class="face right">G</div>
            <div :v-show="isCubeVisible" class="face top">O</div>
            <div :v-show="isCubeVisible" class="face bottom">5</div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Watch } from 'vue-property-decorator';
    import { BingoBoard as BingoBoardClass } from './bingoboard';

    @Component
    export default class BingoBoard extends BingoBoardClass {
        tiles: Array<any> = [];
        sequenceIndex: number = 0;
        isRolling: boolean = false;
        currentX: number = 0;
        currentY: number = 0;
        posX: number = 2;
        posY: number = 2;
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
            { y: 2, x: 2 },
            { y: 3, x: 2 },
            { y: 3, x: 1 },
            { y: 2, x: 1 },
            { y: 1, x: 1 },
            { y: 1, x: 2 },
            { y: 1, x: 3 },
            { y: 2, x: 3 },
            { y: 3, x: 3 },
            { y: 4, x: 3 },
            { y: 4, x: 2 },
            { y: 4, x: 1 },
            { y: 4, x: 0 },
            { y: 3, x: 0 },
            { y: 2, x: 0 },
            { y: 1, x: 0 },
            { y: 0, x: 0 },
            { y: 0, x: 1 },
            { y: 0, x: 2 },
            { y: 0, x: 3 },
            { y: 0, x: 4 },
            { y: 1, x: 4 },
            { y: 2, x: 4 },
            { y: 3, x: 4 },
            { y: 4, x: 4 },
        ];

        mounted() {
            this.generateTilePositions();
            this.setupCubeDimensions();
        }

        setupCubeDimensions() {
            const tileSize = this.tiles[0];
            const cube = this.$refs.cube as HTMLElement;
            cube.style.width = `${tileSize.width}px`;
            cube.style.height = `${tileSize.height}px`;
            cube.style.transformOrigin = `${tileSize.width / 2}px ${tileSize.height / 2}px`;

            const faces = cube.querySelectorAll('.face') as NodeListOf<HTMLElement>;
            faces.forEach((face) => {
                face.style.width = `${tileSize.width}px`;
                face.style.height = `${tileSize.height}px`;
            });

            const startingTile = this.tiles[2 * 5 + 2];
            cube.style.transform = `translate(${startingTile.x}px, ${startingTile.y}px)`;
        }

        getNextTile() {
            this.sequenceIndex++;
            if (this.sequenceIndex < this.sequence.length) {
                const { x, y } = this.sequence[this.sequenceIndex];
                return this.tiles[y * 5 + x];
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
                if (tile.x > this.tiles[this.posY * 5 + this.posX].x) {
                    this.currentY += 90;
                } else if (tile.x < this.tiles[this.posY * 5 + this.posX].x) {
                    this.currentY -= 90;
                } else if (tile.y > this.tiles[this.posY * 5 + this.posX].y) {
                    this.currentX -= 90;
                } else if (tile.y < this.tiles[this.posY * 5 + this.posX].y) {
                    this.currentX += 90;
                }

                const currentTile = this.$refs.cells[this.posY * 5 + this.posX] as HTMLElement;
                currentTile.style.visibility = 'visible';

                this.posX = this.sequence[this.sequenceIndex].x;
                this.posY = this.sequence[this.sequenceIndex].y;

                const cube = this.$refs.cube as HTMLElement;
                const transitionDuration = this.calculateTransitionDuration();
                console.log('Tile width and height:', tile.width, tile.height);

                cube.style.transitionDuration = `${transitionDuration}s`;
                cube.style.transform = `translate(${tile.x}px, ${tile.y}px) rotateX(${this.currentX}deg) rotateY(${this.currentY}deg)`;

                this.isRolling = true;

                this.rollStepTimeout = setTimeout(() => {
                    this.isRolling = false;
                    cube.style.transitionDuration = '0.150s';
                    this.rollStep();
                }, transitionDuration * 1000);
                currentTile.style.visibility = 'visible';
            } catch (error) {
                console.log('Error in rollStep:', error);
                this.stopAnimation();
            }
        }

        generateTilePositions() {
            const bingoBoardRect = this.$el.getBoundingClientRect();
            const cells = this.$refs.cells as HTMLElement[];

            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    const cell = cells[i * 5 + j];
                    const rect = cell.getBoundingClientRect();
                    this.tiles.push({
                        x: rect.left - bingoBoardRect.left,
                        y: rect.top - bingoBoardRect.top,
                        width: rect.width,
                        height: rect.height,
                    });
                }
            }
        }

        hideTiles() {
            const tiles = this.$refs.cells as HTMLElement[];
            tiles.forEach((tile) => (tile.style.visibility = 'hidden'));

            return new Promise<void>((resolve) => {
                setTimeout(resolve, 1000);
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
                const cube = this.$refs.cube as HTMLElement;
                cube.style.display = 'block';
                this.initializeAnimationState();

                this.rollTimeout = setTimeout(() => this.rollStep(), 900);
                this.stopTimeout = setTimeout(() => this.stopAnimation(), 4000);
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
            const startingTile = this.tiles[2 * 5 + 2]; // Middle tile
            cube.style.transform = `translate(${startingTile.x}px, ${startingTile.y}px)`;
            cube.style.display = 'none';

            // Reveal the last tile in the sequence
            const lastTileIndex =
                this.sequence[this.sequence.length - 1].y * 5 + this.sequence[this.sequence.length - 1].x;
            const lastTile = this.$refs.cells[lastTileIndex] as HTMLElement;
            lastTile.style.visibility = 'visible';
        }
    }
</script>

<style src="./bingoboard.css"></style>
