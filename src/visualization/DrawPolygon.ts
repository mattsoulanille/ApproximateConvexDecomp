import { Polygon } from "../PolygonTypes";
import * as PIXI from "pixi.js";
import earcut = require("earcut");

function MakePolygon(poly: Polygon) {
    var flattened = earcut.flatten([poly]).vertices;
    return new PIXI.Polygon(flattened)

}


export { MakePolygon }
