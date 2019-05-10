import * as PIXI from "pixi.js";
import { MakePolygon } from "./DrawPolygon";
import { Polygon, Vector } from "../PolygonTypes";
import { Button } from "./Button";
import ShortestPathTree from "../ShortestPathTree";
import { ClosestPoint } from "../VectorFunctions";


const app = new PIXI.Application({
    resolution: window.devicePixelRatio || 1,
    resizeTo: window,
    width: window.innerWidth,
    height: window.innerHeight
});

document.body.appendChild(app.view);





const c = new PIXI.Container();
app.stage.addChild(c)

c.visible = true;
c.interactive = true;


const g = new PIXI.Graphics();
c.addChild(g);



c.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);
window.addEventListener("resize", function() {
    c.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);
});


c.addListener('pointerup', onMouseUp);
c.addListener('pointermove', onMouseMove);

var mode = "placeVertex";

let poly1: Polygon = [];
var pixiPoly1: PIXI.Polygon;


function onMouseUp(event: PIXI.interaction.InteractionEvent) {
    switch (mode) {
        case "placeVertex": placeVertex(event); break;
        case "placeClosestPoint": placeClosestPoint(event); break;
    }

}

function onMouseMove(event: PIXI.interaction.InteractionEvent) {
    switch (mode) {
        case "placeClosestPoint": highlightClosestPoint(event); break;
    }
}

function highlightClosestPoint(event: PIXI.interaction.InteractionEvent) {
    // Hightlights the closest point to your cursor
    var pixiPoint = event.data.getLocalPosition(c);
    var mousePoint: Vector = [pixiPoint.x, pixiPoint.y];

    try {
        var closest = ClosestPoint(mousePoint, poly1);
        highlight(poly1[closest]);
    }
    catch (e) {
        highlight(null);
    }

}

var highlightGraphics = new PIXI.Graphics();
c.addChild(highlightGraphics);
function highlight(point: Vector | null) {
    highlightGraphics.clear();

    if (point == null) {
        return;
    }
    else {
        highlightGraphics.lineStyle(4, 0x00ff00);
        highlightGraphics.drawCircle(point[0], point[1], 8);
    }

}

function placeClosestPoint(event: PIXI.interaction.InteractionEvent) {
    // Construct the shortest path tree
    var pixiPoint = event.data.getLocalPosition(c);
    var point: Vector = [pixiPoint.x, pixiPoint.y];
    var closestPoint = ClosestPoint(point, poly1);

    var tree = new ShortestPathTree(poly1, closestPoint);
    console.log(tree);

}


function placeVertex(event: PIXI.interaction.InteractionEvent) {
    var pixiPoint = event.data.getLocalPosition(c);
    var point: Vector = [pixiPoint.x, pixiPoint.y];
    if (poly1.length > 0) {
        var lastPoint = poly1[poly1.length - 1];
        if (point[0] == lastPoint[0] &&
            point[1] == lastPoint[1]) {
            return; // No degenerate points please
        }
    }
    poly1.push(point);
    pixiPoly1 = MakePolygon(poly1);
    console.log("adding point " + point);
    render();
}

(window as any).poly1 = poly1;
(window as any).g = g;


const resetButton = new Button("Reset");
resetButton.container.position.x = 10;
resetButton.container.position.y = 10;
const buttons = new PIXI.Container();
app.stage.addChild(buttons);

buttons.addChild(resetButton.container);
resetButton.onPress = function() {
    poly1.length = 0;
    pixiPoly1 = new PIXI.Polygon();
    render();
};

const placeVertexButton = new Button("Place Vertex");
placeVertexButton.container.position.x = 10;
placeVertexButton.container.position.y = 50;
buttons.addChild(placeVertexButton.container);
placeVertexButton.onPress = function() {
    mode = "placeVertex";
}


const placeClosestPointButton = new Button("Place Closest Point");
placeClosestPointButton.container.position.x = 10;
placeClosestPointButton.container.position.y = 90;
buttons.addChild(placeClosestPointButton.container);
placeClosestPointButton.onPress = function() {
    mode = "placeClosestPoint";
}






function render() {
    g.clear()
    g.lineStyle(4, 0xff0000);
    g.drawPolygon(pixiPoly1);
}





