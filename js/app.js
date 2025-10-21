const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const finishBtn = document.getElementById('finishPolygon');
const clearBtn = document.getElementById('clearAll');
const currentPointsSpan = document.getElementById('currentPoints');
const polygonsDiv = document.getElementById('polygons');

const MODES = { CREATE: 'create', POLYGON_INTERSECTION: 'polygonIntersection' };
let currentMode = MODES.CREATE;

let polygons = [];
let currentPolygon = [];
let selectedPolygonIndex = -1;

const currentPolygonColor = '#FF5722';
const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#f97316', '#84cc16', '#3b82f6'];
let colorIndex = 0;

let firstPolygonForIntersection = -1;
let secondPolygonForIntersection = -1;
let intersectionPolygon = null;

function init() {
    clearScene()

    canvas.addEventListener('click', onCanvasClick);
    finishBtn.addEventListener('click', finishPolygon);
    clearBtn.addEventListener('click', clearScene);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && currentPolygon.length > 0) finishPolygon();
    });

    document.getElementById('modeCreate').addEventListener('click', () => switchMode(MODES.CREATE));
    document.getElementById('modePolygonIntersection').addEventListener('click', () => switchMode(MODES.POLYGON_INTERSECTION));

    redraw();
}

function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));

    const resultPanel = document.getElementById('resultPanel');
    const resultText = document.getElementById('resultText');

    if (mode === MODES.CREATE) {
        document.getElementById('modeCreate').classList.add('active');
        resultPanel.style.display = 'none';
    } else if (mode === MODES.POLYGON_INTERSECTION) {
        document.getElementById('modePolygonIntersection').classList.add('active');
        resultPanel.style.display = 'block';
        resultText.innerHTML = 'Выберите два выпуклых полигона для пересечения';
    }

    currentPolygon = [];
    firstPolygonForIntersection = -1;
    secondPolygonForIntersection = -1;
    intersectionPolygon = null;
    updatePolygonList();
    redraw();
}

function updateResultText(text) {
    const panel = document.getElementById('resultPanel');
    const resultText = document.getElementById('resultText');

    if (text) {
        panel.style.display = 'block';
        resultText.innerHTML = text;
    } else {
        panel.style.display = 'none';
        resultText.innerHTML = '';
    }
}

function onCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (currentMode === MODES.CREATE) {
        handleCreateClick(point);
    } else if (currentMode === MODES.POLYGON_INTERSECTION) {
    }
}

function handleCreateClick(point) {
    currentPolygon.push(point);
    currentPointsSpan.textContent = currentPolygon.length.toString();
    redraw();
}

function calculatePolygonIntersection() {
    const poly1 = polygons[firstPolygonForIntersection];
    const poly2 = polygons[secondPolygonForIntersection];

    if (poly1.points.length < 3 || poly2.points.length < 3) {
        updateResultText('Оба полигона должны иметь минимум 3 вершины!');
        return;
    }

    // Пробуем оба порядка и выбираем результат с большей площадью
    const result1 = sutherlandHodgman(poly1.points, poly2.points);
    const result2 = sutherlandHodgman(poly2.points, poly1.points);

    const area1 = result1.length > 0 ? calculatePolygonArea(result1) : 0;
    const area2 = result2.length > 0 ? calculatePolygonArea(result2) : 0;

    // Выбираем результат с большей площадью
    intersectionPolygon = area1 >= area2 ? result1 : result2;

    if (intersectionPolygon && intersectionPolygon.length > 0) {
        const area = calculatePolygonArea(intersectionPolygon);
        updateResultText(`
            Полигон 1: ${poly1.points.length} вершин<br>
            Полигон 2: ${poly2.points.length} вершин<br>
            Пересечение: ${intersectionPolygon.length} вершин<br>
            Площадь: ${area.toFixed(2)} пикс²
        `);
    } else {
        updateResultText('Полигоны не пересекаются!');
        intersectionPolygon = null;
    }

    redraw();
}

function finishPolygon() {
    if (currentPolygon.length === 0) return;

    polygons.push({ points: [...currentPolygon], color: colors[colorIndex % colors.length] });
    colorIndex++;
    currentPolygon = [];
    currentPointsSpan.textContent = '0';

    updatePolygonList();
    redraw();
}

function clearScene() {
    polygons = [];
    currentPolygon = [];
    selectedPolygonIndex = -1;
    colorIndex = 0;
    currentPointsSpan.textContent = '0';
    firstPolygonForIntersection = -1;
    secondPolygonForIntersection = -1;
    intersectionPolygon = null;
    updateResultText(null);
    updatePolygonList();
    redraw();
    switchMode(MODES.CREATE)
}

function updatePolygonList() {
    if (polygons.length === 0) {
        polygonsDiv.innerHTML = '<em style="color: #999;">Нет полигонов</em>';
        return;
    }

    polygonsDiv.innerHTML = polygons.map((polygon, index) => {
        const type = polygon.points.length === 1 ? 'Точка' : polygon.points.length === 2 ? 'Ребро' : `Полигон (${polygon.points.length})`;

        let selected = false;
        if (currentMode === MODES.POLYGON_INTERSECTION) {
            selected = index === firstPolygonForIntersection || index === secondPolygonForIntersection;
        } else {
            selected = index === selectedPolygonIndex;
        }

        let label = '';
        if (index === firstPolygonForIntersection) label = ' [1]';
        if (index === secondPolygonForIntersection) label = ' [2]';

        return `<div class="polygon-item ${selected ? 'selected' : ''}" onclick="selectPolygon(${index})" style="border-left: 4px solid ${polygon.color}">
                    ${index + 1}. ${type}${label}
                </div>`;
    }).join('');
}

function selectPolygon(index) {
    if (currentMode === MODES.POLYGON_INTERSECTION) {
        if (firstPolygonForIntersection === -1) {
            firstPolygonForIntersection = index;
        } else if (secondPolygonForIntersection === -1 && index !== firstPolygonForIntersection) {
            secondPolygonForIntersection = index;
            calculatePolygonIntersection();
        } else {
            firstPolygonForIntersection = index;
            secondPolygonForIntersection = -1;
            intersectionPolygon = null;
        }
    } else {
        selectedPolygonIndex = selectedPolygonIndex === index ? -1 : index;
    }

    updatePolygonList();
    redraw();
}

init();
