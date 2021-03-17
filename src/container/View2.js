import * as React from "react";
import { times } from "lodash";
import useDimensions from "react-cool-dimensions";
import { ResizeObserver } from "@juggle/resize-observer";
import { VariableSizeGrid as Grid, areEqual } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { sum } from "lodash";

import { DataGridColumn } from "./DataGrid1/DataGridColumn";
import { DataGridGroup } from "./DataGrid1/DataGridGroup";

const numberOfColumns = 30;

const columns = [];

times(numberOfColumns, (c) => {
  columns.push({ value: `column ${c}` })
})

const datas = [];

times(50, (g) => {

  if (g === 0) {
    const row = [];

    times(numberOfColumns, (c) => {
      row.push({ row: 0, column: c, value: `Column ${0}${c}` })
    })

    datas.push(row)
  } else {
    const group = { title: `Group ${g}`, rows: [] };

    times(10, (r) => {
      const row = [];
  
      times(numberOfColumns, (c) => {
        row.push({ group: g, row: r, column: c, value: `value ${g}${r}${c}` })
      })
  
      group.rows.push(row);
    })

    datas.push(group)
  }
})

export const GridContext = React.createContext({})

const sizes = [];
let previousRowIndex = -1;
let rendered = {};

export const View2 = () => {
  const ref = React.useRef(null);

  const { width, height, top, left } = useDimensions({
    ref,
    useBorderBoxSize: true,     // Tell the hook to measure based on the border-box size, default is false
    polyfill: ResizeObserver,
  });

  const showSizes = (event) => {
    console.log(sizes, width, height)
  }

  const getWidth = () => {
    if (sizes.length === 0) {
      return 'auto'
    }

    return sum(sizes[0].map(x => x.width));
  }

  const renderCell = React.memo(props => {
    const { data, rowIndex, columnIndex, style } = props;
    const row = data[rowIndex];

    if (!row.rows) {
      const cell = row[columnIndex];

      return (
        <div style={style}>
          {cell.value}
        </div>
      )
    }

    // console.log("ROW " + rowIndex)

    if (previousRowIndex === rowIndex) {
      return null;
    }

    console.log("ROW " + rowIndex +  " " + columnIndex, row, style)
    previousRowIndex = rowIndex;

    return (
      <div style={style}>
        <div className="group">
          <div className="groupHeader">
            {row.title}
          </div>
          <div className="groupContent">

          </div>
        </div>
      </div>
    )
  }, areEqual)

  return (
    <div className="App">
      <div className='Toolbar'>
        <button onClick={showSizes}>Show</button>
      </div>
      <div 
        ref={ref}
        className='Container'
      >
        <GridContext.Provider value={{ sizes, width, height }}>
          <AutoSizer>
              {({ height, width }) => {
                return (
                  <Grid
                    width={width}
                    height={height}
                    itemData={datas}
                    rowCount={datas.length}
                    rowHeight={() => 50}
                    columnCount={datas[0].length}
                    columnWidth={() => 100}
                  >
                    {renderCell}
                  </Grid>
                )
              }}
          </AutoSizer>
        </GridContext.Provider>
      </div>
    </div>
  );
}
