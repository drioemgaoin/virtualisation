import * as React from "react";
import { areEqual } from "react-window";
import useDimensions from "react-cool-dimensions";
import { ResizeObserver } from "@juggle/resize-observer";
import { isEqual } from "lodash"

import { getSize } from "../../util";
import { GridContext } from "../View1";

export const DataGridColumn = React.memo(props => {
    const { value } = props;

    const ref = React.useRef(null);
    const { sizes } = React.useContext(GridContext)

    useDimensions({
        ref,
        useBorderBoxSize: true,     // Tell the hook to measure based on the border-box size, default is false
        polyfill: ResizeObserver,   // Use polyfill to make this feature works on more browsers
        onResize: ({ width, height }) => {
            const nextSize = { width, height };
            const currentSize = getSize(sizes, 0, props.columnIndex)
            
            if (!isEqual(currentSize, nextSize)) {
                if (!sizes[0]) {
                    sizes[0] = [];
                }

                sizes[0][props.index] = nextSize;
            }
        },
    });

    return (
        <div
            className='Column'
            ref={ref}
        >
            {value}
        </div>
    )
}, areEqual)