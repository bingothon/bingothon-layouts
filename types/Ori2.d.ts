export type Position = {
  x: number,
  y: number,
}

export type Ori2BingoSquare = {
  position: Position,
  text: string,
  universeIds: number[],
  completedBy: number[],
}

export type Ori2BingoUniverse = {
  id: number,
  lines: number,
  squares: number,
}

export type Ori2BingoBoard = {
  size: number,
  universes: Ori2BingoUniverse[],
  squares: Ori2BingoSquare[],
}