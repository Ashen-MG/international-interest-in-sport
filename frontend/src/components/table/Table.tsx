import {Table as BootstrapTable} from "react-bootstrap";
import {SortUp, SortDown} from "react-bootstrap-icons";
import React, {useEffect, useState} from "react";

export type TableColumnNameType = {
  name: string,
  sortable?: boolean,
  alignRight?: boolean
};
export type TableCellValueOnly = string | number;
export type TableCellComponent = {
  element?: React.ReactNode
  value: TableCellValueOnly
}
export type TableCell = TableCellValueOnly | TableCellComponent;
export type TableRowsType = TableCell[][];

type SortFunction = (i: number, reverse: boolean) => void;

interface TableProps {
  columnNames: TableColumnNameType[],
  rows: TableRowsType
}

/**
 * General table component.
 * @param columnNames: Array of names.
 * @param rows: Data for the table.
 * Length of one row in `rows` should be the same size as length of `columnNames`.
 * */
export const Table = ({columnNames, rows}: TableProps) => {

  const [sortedRows, setSortedRows] = useState<TableRowsType>([]);

  /** Sort values by column `i`. */
  const sortColumn: SortFunction = (i, reverse) => {
    setSortedRows([...sortedRows.sort((row1, row2) => {
      let row1Value = row1[i], row2Value = row2[i];
      row1Value = typeof row1Value === "object" ? row1Value.value : row1Value;
      row2Value = typeof row2Value === "object" ? row2Value.value : row2Value;
      return (reverse ? 1 : -1) * (row1Value > row2Value ? 1 : row1Value < row2Value ? -1 : 0);
    })]);
  }

  useEffect(() => {
    setSortedRows([...rows]);
  }, [columnNames, rows]);

  return (
  	<BootstrapTable striped bordered responsive="xl">
      <TableHead columnNames={columnNames} sort={sortColumn} />
      <TableBody columnNames={columnNames} rows={sortedRows} />
    </BootstrapTable>
  )
}

interface TableHeadProps {
  columnNames: TableColumnNameType[],
  sort: SortFunction
}

const TableHead = ({columnNames, sort}: TableHeadProps) => {

  /**
   * Determine icon for next ordering and switching between descending & ascending ordering.
   * i-th boolean value corresponds to i-th column.
   * */
  const [iconsSwitch, setIconsSwitch] = useState<boolean[]>([]);

  useEffect(() => {
    setIconsSwitch(Array(columnNames.length).fill(true));
  }, [columnNames]);

  const switchIcon = (i: number) =>  {
    const _iconsSwitch = [...iconsSwitch];
    _iconsSwitch[i] = !_iconsSwitch[i];
    setIconsSwitch(_iconsSwitch);
  }

  const iconProps = {
    className: "ms-1 cursor-pointer",
    size: 19
  }
  const SortDownIcon = <SortDown {...iconProps} />
  const SortUpIcon = <SortUp {...iconProps} />

  return (
    <thead>
    <tr>
      { columnNames.map((column, i) =>
        <th key={`column-name-${i}`} className={`align-middle`}>
          <div
            className={`d-flex align-items-center`}
            onClick={() => {
              if (column.sortable) {
                sort(i, iconsSwitch[i]);
                switchIcon(i);
              }
            }}
          >
            { column.name }
            { column.sortable && (iconsSwitch[i] ? SortDownIcon : SortUpIcon) }
          </div>
        </th>
      )}
    </tr>
    </thead>
  )
}

interface TableBodyProps {
  columnNames: TableColumnNameType[],
  rows: TableRowsType
}

const TableBody = ({columnNames, rows}: TableBodyProps) => {

  /** Indexes of columns that should be aligned horizontally to the right. */
  const [alignRightColumns, setAlignRightColumns] = useState<number[]>([]);

  useEffect(() => {
    setAlignRightColumns(columnNames.filter(c => c.alignRight).map((c, i) => i + 1));
  }, [columnNames]);

  return (
    <tbody>
    { rows.map((row, i) =>
      <tr key={`row-${i}`}>
        { row.map((cellValue, j) =>
          <td key={`cell-${i}-${j}`} className={`align-middle ${alignRightColumns.includes(j) ? "text-end" : ""}`}>
            { typeof cellValue === "object" ? (cellValue.element || cellValue.value) : cellValue }
          </td>
        )}
      </tr>
    )}
    </tbody>
  )
}