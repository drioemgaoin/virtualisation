
export const getSize = (sizes, rowIndex, columnIndex) => {
    if (rowIndex >= sizes.length) {
        return { width: 0, height: 0 };
    }

    const rowSizes = sizes[rowIndex];
    if (columnIndex >= rowSizes.length) {
        return { width: 0, height: 0 };
    }

    return rowSizes[columnIndex];
}

export const getDimensionObject = (node) => {
    if (!node) {
        return {};
    }

    const rect = node.getBoundingClientRect();

    return {
        width: rect.width,
        height: rect.height,
        top: "x" in rect ? rect.x : rect.top,
        left: "y" in rect ? rect.y : rect.left,
        x: "x" in rect ? rect.x : rect.left,
        y: "y" in rect ? rect.y : rect.top,
        right: rect.right,
        bottom: rect.bottom
    };
}

export const getElementHeight = (element) => {
    if (!element) {
        return 0;
    }
    
    const margin = 0; //getComputedHeight(element);

    const { top, bottom, height } = getDimensionObject(element);

    const newheight = height + margin || bottom - top;
    return isNaN(newheight) ? 0 : newheight;
}