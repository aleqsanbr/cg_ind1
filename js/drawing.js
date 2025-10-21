function drawPolygon(ctx, points, color, isSelected, isCurrent = false) {
    if (points.length === 0) return;

    const lineWidth = isSelected ? 5 : 2;
    const pointRadius = isSelected ? 8 : 4;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    if (points.length === 1) {
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    if (!isCurrent && points.length > 2) {
        ctx.lineTo(points[0].x, points[0].y);
    }
    ctx.stroke();

    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawCreateMode() {
    if (currentPolygon.length > 0) {
        drawPolygon(ctx, currentPolygon, currentPolygonColor, false, true);
    }
}

function drawPolygonIntersectionMode() {
    if (intersectionPolygon && intersectionPolygon.length > 0) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'; // зеленый полупрозрачный
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(intersectionPolygon[0].x, intersectionPolygon[0].y);
        for (let i = 1; i < intersectionPolygon.length; i++) {
            ctx.lineTo(intersectionPolygon[i].x, intersectionPolygon[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        intersectionPolygon.forEach(p => {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    polygons.forEach((poly, index) => {
        const isSelected = currentMode === MODES.POLYGON_INTERSECTION
            ? (index === firstPolygonForIntersection || index === secondPolygonForIntersection)
            : index === selectedPolygonIndex;

        drawPolygon(ctx, poly.points, poly.color, isSelected);
    });

    if (currentMode === MODES.CREATE) {
        drawCreateMode();
    } else if (currentMode === MODES.POLYGON_INTERSECTION) {
        drawPolygonIntersectionMode();
    }
}