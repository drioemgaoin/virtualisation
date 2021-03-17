import * as React from "react";
import { areEqual } from "react-window";

import { DataGridCell } from "./DataGridCell";

export const DataGridRow = React.memo(props => {
    const { cells, index: rowIndex } = props;
    return (
      <div
        className='Row'
      >
          {cells.map((cell, index) => (<DataGridCell rowIndex={rowIndex} columnIndex={index} {...cell} />))}
      </div>
    )
}, areEqual)