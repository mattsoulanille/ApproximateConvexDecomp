import * as PIXI from "pixi.js";
import { MakePolygon } from "./DrawPolygon";


const app = new PIXI.Application({
    resolution: window.devicePixelRatio || 1,
    resizeTo: window,
    width: window.innerWidth,
    height: window.innerHeight
});

document.body.appendChild(app.view);


const g = new PIXI.Graphics();

g.position.x = window.innerWidth / 2;
g.position.y = window.innerHeight / 2;

app.stage.addChild(g);

g.lineStyle(4, 0xff0000);

let poly1 = MakePolygon([[10, 10], [90, 30], [45, 45]]);

(window as any).poly1 = poly1;
(window as any).g = g;
g.drawPolygon(poly1);