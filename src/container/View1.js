import * as React from "react";
import { times } from "lodash";
import useDimensions from "react-cool-dimensions";
import { ResizeObserver } from "@juggle/resize-observer";
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
  const group = [];
  
  times(10, (r) => {
    const row = [];

    times(numberOfColumns, (c) => {
      row.push({ group: g, row: r, column: c, value: `value ${g}${r}${c}` })
    })

    group.push(row);
  })

  datas.push(group)
})

export const GridContext = React.createContext({})

const sizes = [];

export const View1 = () => {
  const ref = React.useRef(null);

  const { width, height, top, left }  = useDimensions({
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
          <div className='Grid'>
            <div className='Scroll' style={{ width }}>
              <div className='Inner' style={{ width: getWidth() }}>
                <div className='Columns'>
                  {columns.map((column, index) => (<DataGridColumn index={index} {...column} />))}
                </div>
                {datas.map((group, index) => (<DataGridGroup index={index} rows={group} />))}
              </div>
            </div>
          </div>
        </GridContext.Provider>
      </div>
    </div>
  );
}
