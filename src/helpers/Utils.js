/**
 * 
 * @param {*} rectA 
 * @param {*} rectB 
 * @returns bool
 */
const isOverlapping = ( rectA, rectB ) => {
	const a = {
		minX: rectA.x,
		maxX: rectA.x + rectA.width,
		minY: rectA.y,
		maxY: rectA.y + rectA.height,
	};

	const b = {
		minX: rectB.x,
		maxX: rectB.x + rectB.width,
		minY: rectB.y,
		maxY: rectB.y + rectB.height,
	};

    return (
        a.minX < b.maxX &&
        a.maxX > b.minX &&
        a.minY < b.maxY &&
        a.maxY > b.minY
    );
}

export {isOverlapping};