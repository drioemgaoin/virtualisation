import * as React from "react";
import { areEqual } from "react-window";
import useDimensions from "react-cool-dimensions";
import { ResizeObserver } from "@juggle/resize-observer";
import { isEqual } from "lodash"

import { getSize } from "../../util";
import { DataGridRow } from "./DataGridRow";
import { GridContext } from "../View1";

export const DataGridGroup = React.memo(props => {
    const { index, rows } = props;

    const ref = React.useRef(null);
    const { sizes } = React.useContext(GridContext)

    const [open, setOpen] = React.useState(false);

    useDimensions({
      ref,
      useBorderBoxSize: true,     // Tell the hook to measure based on the border-box size, default is false
      polyfill: ResizeObserver,   // Use polyfill to make this feature works on more browsers
      onResize: ({ width, height }) => {
          const nextSize = { width, height };
          const currentSize = getSize(sizes, 0, props.columnIndex)
          
          if (!isEqual(currentSize, nextSize)) {
            if (index >= sizes.length) {
              sizes[index] = [];
            } else if (!sizes[props.index]) {
              sizes[index] = [];
            }

            sizes[index][0] = nextSize;
          }
      },
  });

  const getTop = React.useCallback(() => {
    if (!sizes[index] || sizes[index].length === 0) {
      return undefined;
    }

    const height = sizes[index][0]?.height;
    if (!height) {
      return undefined
    }

    return `${(index + 1) * height}px`
  }, [sizes[index]])

  const handleContent = (event) => {
      setOpen(prev => !prev);
  }

  return (
    <div 
      ref={ref}
      className="Group"
      style={{ top: getTop() }}
    >
      <div
          className="GroupHeader" 
          onClick={handleContent}
      >
        Group {index + 1}
      </div>
      {open && (
          <div
              className="GroupContent" 
          >
              {rows.map((row, index) => (<DataGridRow index={index} cells={row} />))}
          </div>
      )}
    </div>
  )
}, areEqual)