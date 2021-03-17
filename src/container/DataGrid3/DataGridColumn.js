import * as React from "react";
import useDimensions from "react-cool-dimensions";
import { areEqual } from "react-window";
import { isEqual } from "lodash";

import { getSize } from "../../util";
import { GridContext } from "../View3";

export const DataGridColumn = React.memo((props) => {
    const { value } = props;

    const { sizes, columnsRef, rowsRef } = React.useContext(GridContext)

    const { ref } = useDimensions({
      useBorderBoxSize: true,     // Tell the hook to measure based on the border-box size, default is false
      polyfill: ResizeObserver,   // Use polyfill to make this feature works on more browsers
      onResize: ({ width, height }) => {
        const nextSize = { width, height };
        const currentSize = getSize(sizes, 0, props.columnIndex)
        
        if (width === 0 && height === 0 ) {
          return;
        }

        if (!isEqual(currentSize, nextSize)) {
          if (!sizes[0]) {
              sizes[0] = [];
          }

          sizes[0][props.index] = nextSize;

          if (columnsRef.current) {
            columnsRef.current.resetAfterIndex(props.index)
          }

          // if (rowsRef.current) {
          //   rowsRef.current.resetAfterIndex(0)
          // }
        }
      },
    });

    return (
        <div 
          ref={ref}
          className='column'
        >
          {value}
        </div>
    )
}, areEqual)