function crossProduct(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

function sutherlandHodgman(subjectPolygon, clipPolygon) {
    let outputList = [...subjectPolygon];

    // Проходим по каждому ребру отсекающего полигона
    for (let i = 0; i < clipPolygon.length; i++) {
        const clipEdgeStart = clipPolygon[i];
        const clipEdgeEnd = clipPolygon[(i + 1) % clipPolygon.length];

        const inputList = outputList;
        outputList = [];

        if (inputList.length === 0) break;

        // Проходим по каждой вершине
        for (let j = 0; j < inputList.length; j++) {
            const currentVertex = inputList[j];
            const previousVertex = inputList[(j + inputList.length - 1) % inputList.length];

            const currentInside = isPointInsideEdge(currentVertex, clipEdgeStart, clipEdgeEnd);
            const previousInside = isPointInsideEdge(previousVertex, clipEdgeStart, clipEdgeEnd);

            if (currentInside) {
                if (!previousInside) {
                    const intersection = lineIntersection(previousVertex, currentVertex, clipEdgeStart, clipEdgeEnd);
                    if (intersection) outputList.push(intersection);
                }
                outputList.push(currentVertex);
            } else if (previousInside) {
                const intersection = lineIntersection(previousVertex, currentVertex, clipEdgeStart, clipEdgeEnd);
                if (intersection) outputList.push(intersection);
            }
        }
    }

    return outputList;
}

function isPointInsideEdge(point, edgeStart, edgeEnd) {
    return crossProduct(edgeStart, edgeEnd, point) >= 0;
}

function lineIntersection(p1, p2, p3, p4) {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

    return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
    };
}

function calculatePolygonArea(points) {
    if (points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
}
