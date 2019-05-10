import * as PIXI from "pixi.js";
import { MakePolygon } from "./DrawPolygon";
import { Polygon } from "../PolygonTypes";


const app = new PIXI.Application({
    resolution: window.devicePixelRatio || 1,
    resizeTo: window,
    width: window.innerWidth,
    height: window.innerHeight
});

document.body.appendChild(app.view);

app.stage.interactive = true;

const g = new PIXI.Graphics();
app.stage.addChild(g);




document.addEventListener('mouseup', onMouseUp);


let poly1: Polygon = [];
var pixiPoly1: PIXI.Polygon;
function onMouseUp(event: MouseEvent) {
    g.clear()
    g.lineStyle(4, 0xff0000);
    poly1.push([event.clientX, event.clientY]);
    pixiPoly1 = MakePolygon(poly1);
    g.drawPolygon(pixiPoly1);
}

(window as any).poly1 = poly1;
(window as any).g = g;
