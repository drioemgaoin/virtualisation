import * as React from "react";
import useDimensions from "react-cool-dimensions";
import { ResizeObserver } from "@juggle/resize-observer";
import { VariableSizeGrid as Grid, VariableSizeList as List, areEqual } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { isEqual, head, max, omit, reduce, sum, tail, times } from "lodash";

import { getSize } from "../util";
import { DataGridGroup } from "./DataGrid3/DataGridGroup";
import { DataGridColumn } from "./DataGrid3/DataGridColumn";

const numberOfGroups = 50;
const numberOfColumns = 30;
const numberOfRows = 20;
const groupSpacing = 20;

const datas = [];

times(numberOfGroups, (g) => {

  if (g === 0) {
    const row = [];

    times(numberOfColumns, (c) => {
      row.push({ row: 0, column: c, value: c % 2 === 0 ? `Column long ${c}` : `Column ${0}${c}` })
    })

    datas.push(row)
  } else {
    const group = { title: `Group ${g}`, rows: [] };

    times(numberOfRows, (r) => {
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

export const View3 = () => {
  const ref = React.useRef(null);
  const rowsRef = React.useRef(null);
  const rowsInnerRef = React.useRef(null);
  const rowsOuterRef = React.useRef(null);
  const columnsRef = React.useRef(null);
  const columnsInnerRef = React.useRef(null);
  const columnsOuterRef = React.useRef(null);
  const rowContainerRef = React.useRef(null);

  const { width, height } = useDimensions({
    ref,
    useBorderBoxSize: true,     // Tell the hook to measure based on the border-box size, default is false
    polyfill: ResizeObserver,
  });

  const showSizes = (event) => {
    console.log(sizes, width, height)
  }

  const getTotalWidth = () => {
    if (sizes.length === 0) {
      return 0;
    }

    return sum(sizes[0].map(x => x.width)) + (groupSpacing * 2);
  }

  const renderGroup = React.memo(props => {
    const { data, index, style } = props;
    const row = data[index];
    const childrenRows = row.rows;

    return (
      <div 
        data-debug={`group-${index + 1}`}
        style={{ 
          ...style,
          width: props.containerWidth || 'inherit',
          top: `${parseFloat(style.top) + 60}px`,
          // left: groupSpacing
          left: style.left + groupSpacing
        }}
      >
        <DataGridGroup
          title={row.title}
          index={index}
          rows={childrenRows}
          rowsOuterRef={columnsOuterRef}
        />
      </div>
    )
  }, areEqual)

  const renderColumn = React.memo(props => {
    const { data, index, style } = props;
    const column = data[0][index];

    return (
      <>
        {index === 0 && (
          <div 
            className='colAdornment'
            style={{ position: 'absolute', left: 0, width: groupSpacing, height: '39px' }}
          />
        )}
        <div 
          style={{ 
            ...style, 
            left: style.left + groupSpacing,
            height: 'auto',
            width: 'fit-content' 
          }}
        >
          <DataGridColumn
            index={index}
            value={column.value}
          />
        </div>
        {index === datas[0].length - 1 && (
          <div 
            tabIndex={0}
            className='colAdornment'
            style={{ position: 'absolute', right: 0, width: groupSpacing, height: '39px' }}
          />
        )}
      </>
    )
  }, areEqual)

  const ColumnsInnerElementType = React.memo(React.forwardRef(({ style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        data-debug={style.width}
        style={{
          ...style,
          width: style.width + (groupSpacing * 2),
          position: 'relative'
        }}
        {...rest}
      />
    )
  }), areEqual); 

  const ColumnsOuterElementType = React.memo(React.forwardRef(({ style, ...rest }, ref) => {
    // TODO: create a method for that !!
    const scrollWidth = (rowsOuterRef.current?.offsetWidth || 0) - (rowsOuterRef.current?.clientWidth || 0);

    return (
      <div
        ref={ref}
        style={{
          ...style,
          width: style.width - scrollWidth
        }}
        {...rest}
      />
    )
  }), areEqual);

  const RowsInnerElementType = React.memo(React.forwardRef(({ style, children, ...rest }, ref) => {
    // TODO: create a method for that !!
    const scrollWidth = (rowsOuterRef.current?.offsetWidth || 0) - (rowsOuterRef.current?.clientWidth || 0);
    const innerWidth = getTotalWidth() - scrollWidth;

    const items = React.Children.toArray(children);
    return (
      <div
        ref={ref}
        data-debug='rows-inner'
        style={{
          ...style,
          width: innerWidth,
        }}
        {...rest}
      >
        {items.map(x => React.cloneElement(x, { ...x.props, containerWidth: innerWidth - (groupSpacing * 2) }))}
      </div>
    )
  }), areEqual);

  const RowsOuterElementType = React.memo(React.forwardRef(({ style, ...rest }, ref) => {
    // TODO: create a method for that !!
    const scrollHeight = (columnsOuterRef.current?.offsetHeight || 0) - (columnsOuterRef.current?.clientHeight || 0);

    return (
      <div
        ref={ref}
        style={{
          ...style,
          height: `${parseFloat(style.height) - scrollHeight}px`,
          overflowX: 'hidden'
        }}
        {...rest}
      />
    )
  }), areEqual);

  const handleColumnsScroll = React.useCallback(({ scrollOffset }) => {
    if (rowsOuterRef.current) {
      rowsOuterRef.current.scrollLeft = scrollOffset;
    }

    if (rowsRef.current) {
      rowsRef.current.resetAfterIndex(0);
    }
  }, [])

  const getColumnWidth = (index) => {
    const defaultWidth = 100;
    // if (index === 0 || index === head(datas)?.length - 1) {
    //   return groupSpacing;
    // } 

    if (sizes.length === 0) {
      return defaultWidth;
    }

    if (index >= sizes[0].length) {
      return defaultWidth;
    }

    return sizes[0][index]?.width || defaultWidth;
  }

  const getRowHeight = (index) => {
    const currentIndex = index + 1;
    const defaultHeight = 50;

    if (currentIndex >= sizes.length) {
      return defaultHeight
    }

    const row = sizes[currentIndex];
    if (row.length === 0) {
      return defaultHeight
    }

    return max(row.map(x => x?.height)) || defaultHeight;
  }

  return (
    <div className="App">
      <div 
        ref={ref}
        className='grid'
      >
        <GridContext.Provider value={{ sizes, width, height, rowsRef, columnsRef }}>
          <AutoSizer>
              {({ height, width }) => {
                return (
                  <List
                    ref={columnsRef}
                    outerRef={columnsOuterRef}
                    innerRef={columnsInnerRef}
                    width={width}
                    height={height}
                    itemData={datas}
                    itemCount={datas[0].length}
                    itemSize={getColumnWidth}
                    layout='horizontal'
                    outerElementType={ColumnsOuterElementType}
                    innerElementType={ColumnsInnerElementType}
                    onScroll={handleColumnsScroll}
                  >
                    {renderColumn}
                  </List>
                )
              }}
          </AutoSizer>
          <AutoSizer>
              {({ height, width }) => {
                return (
                  <List
                    ref={rowsRef}
                    outerRef={rowsOuterRef}
                    innerRef={rowsInnerRef}
                    width={width}
                    height={height}
                    itemData={tail(datas)}
                    itemCount={tail(datas).length}
                    itemSize={(index) => getRowHeight(index) + groupSpacing}
                    outerElementType={RowsOuterElementType}
                    innerElementType={RowsInnerElementType}
                  >
                    {renderGroup}
                  </List>
                )
              }}
          </AutoSizer>
        </GridContext.Provider>
      </div>
    </div>
  );
}
