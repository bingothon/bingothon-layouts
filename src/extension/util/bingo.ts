export function toNxMArray<E>(cells: E[], columns: number, rows: number): E[][] {
    return new Array(columns).fill(0).map((_, columnIndex) =>
        new Array(rows).fill(0).map((_, rowIndex) =>
            cells[columnIndex * rows + rowIndex]
        )
    );
}