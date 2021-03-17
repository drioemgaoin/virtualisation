import * as React from "react";
import useDimensions from "react-cool-dimensions";
import { VariableSizeGrid as Grid, VariableSizeList as List, areEqual } from "react-window";
import { head, isEqual } from "lodash";
import clsx from 'clsx';

import { getSize } from "../../util";
import { GridContext } from "../View3";

export const DataGridGroup = React.memo(props => {
    const { index, rows = [], title, rowsOuterRef } = props;

    const ref = React.useRef(null);
    const innerRef = React.useRef(null);
    const outerRef = React.useRef(null);

    const { sizes, width, rowsRef } = React.useContext(GridContext)

    const [open, setOpen] = React.useState(false);

    useDimensions({
        ref,
        useBorderBoxSize: true,     // Tell the hook to measure based on the border-box size, default is false
        polyfill: ResizeObserver,   // Use polyfill to make this feature works on more browsers
        onResize: ({ width, height }) => {
          const nextSize = { width, height };
          const currentSize = getSize(sizes, 0, props.columnIndex)
          
          if (!isEqual(currentSize, nextSize)) {
            if (!sizes[index + 1]) {
                sizes[index + 1] = [];
            }

            sizes[index + 1][0] = nextSize;
  
            if (rowsRef.current) {
                rowsRef.current.resetAfterIndex(index)
            }
          }
        },
    });

    React.useLayoutEffect(() => {
        if (rowsOuterRef.current) {
            rowsOuterRef.current.addEventListener('scroll', handleScrollChanged)
        }

        return () => {
            if (rowsOuterRef.current) {
                rowsOuterRef.current.removeEventListener('scroll', handleScrollChanged)
            }
        }
    }, [rowsOuterRef.current])

    const getColumnWidth = React.useCallback((index) => {
        const defaultWidth = 100;

        if (sizes.length === 0) {
        return defaultWidth;
        }

        if (index >= sizes[0].length) {
        return defaultWidth;
        }

        return sizes[0][index]?.width || defaultWidth;
    }, [sizes])

    const handleScrollChanged = React.useCallback((event) => {
        const { srcElement } = event;

        if (outerRef.current) {
            const rowsWidth = ref.current.clientWidth;
            const groupWidth = outerRef.current.clientWidth;
            const rowsHorizontalScrollLeft = srcElement.scrollLeft;
            
            if (20 < rowsHorizontalScrollLeft && rowsHorizontalScrollLeft < rowsWidth - 40) {
                console.log(rowsWidth, groupWidth, rowsHorizontalScrollLeft)
                outerRef.current.scrollLeft = rowsHorizontalScrollLeft;
                outerRef.current.style.left = `${rowsHorizontalScrollLeft}px`;
            }
            

            // const spread = Math.min(rowsWidth - (groupWidth + rowsHorizontalScrollLeft - 20), 0)
            // const left = Math.max(rowsHorizontalScrollLeft - 20, 0)
            // outerRef.current.scrollLeft = left;
            // outerRef.current.style.left = `${rowsHorizontalScrollLeft + spread}px`;
        }
    }, [])

    const handleClick = React.useCallback(() => {
        setOpen(prev => !prev);
    }, [])

    const GroupContentOuterElementType = React.memo(React.forwardRef(({ style, ...rest }, ref) => {
        // console.log(style)
        return (
            <div
                ref={ref}
                data-debug='group-content-outer'
                style={{
                    ...style,
                    width: style.width + 20,
                    // left: style.left - 20,
                    // overflow: 'hidden'
                }}
                {...rest}
            />
        )
    }), areEqual);

    const renderCell = React.memo(props => {
        const { data, rowIndex, columnIndex, style } = props;
        const cell = data[rowIndex][columnIndex];
    
        return (
          <div 
            style={{ 
                ...style,
                // left: style.left + (columnIndex === 0 ? 20 : 0)
            } }
          >
            <div 
                className={clsx(
                    'cell', 
                    { 
                        'border-left': columnIndex === 0,
                        'border-top': rowIndex === 0 
                    }
                )}
            >
              {cell.value}
            </div>
          </div>
        )
    })

    return (
        <div 
            ref={ref}
            className="group"
        >
            <div 
                className="groupHeader"
                onClick={handleClick}
                // style={{ marginLeft: '20px' }}
            >
                <div>{title}</div>
                <div>{title}</div>
                <div>{title}</div>
            </div>
            {open && (
                <div 
                    className="groupContent"
                    // style={{ marginLeft: '20px' }}
                >
                    <Grid
                        outerRef={outerRef}
                        innerRef={innerRef}
                        itemData={rows}
                        columnCount={head(rows).length}
                        columnWidth={getColumnWidth}
                        height={500}
                        rowCount={rows.length}
                        rowHeight={() => 50}
                        width={width}
                        outerElementType={GroupContentOuterElementType}
                    >
                        {renderCell}
                    </Grid>
                    <div 
                        className="groupFooter"
                    >
                        <div>
                            Footer
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}, areEqual)