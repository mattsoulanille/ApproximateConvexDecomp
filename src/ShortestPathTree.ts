import { Polygon, Vector, Triangle, Triangulation, Graph, GraphNode, LineSegment } from "./PolygonTypes";
import earcut = require("earcut");
import { LineSegmentIntersection } from "./VectorFunctions";


class ShortestPathTree {
    polygon: Polygon;
    triangulation: Triangulation;
    //    dual: Graph<Triangle>; // The dual graph of the triangulation. Actually a tree.
    startVertex: Vector;

    // A map from vectors to their corresponding triangles in the triangulation.
    triangulationMap: Map<number, Set<Triangle>>;
    shortestPathMap: Map<number, number[]>;
    startIndex: number;

    constructor(poly: Polygon, startIndex: number) {
        this.polygon = poly;
        this.startIndex = startIndex;
        this.startVertex = this.polygon[startIndex];

        var flattened = earcut.flatten([this.polygon]).vertices;
        var flattenedTriangulation = earcut(flattened);
        this.triangulation = this.unflattenTriangulation(flattenedTriangulation)
        //        this.dual = this.computeDual(this.triangulation);

        this.triangulationMap = this.computeTriangulationMap(this.triangulation);
        this.shortestPathMap = this.getShortestPaths();

    }



    // Finds a map from each vertex of P to the shortest path from startVertex to p
    getShortestPaths(): Map<number, number[]> {

        var cuspIndex: number = 0;
        var nextIndex = (this.startIndex + 1) % this.polygon.length;
        var funnel: Array<number> = [this.startIndex, nextIndex];

        return this.PATH(funnel, cuspIndex);
    }

    PATH(funnel: Array<number>, cuspIndex: number, processed: Set<Triangle> = new Set(), pathSoFar: Array<number> = [cuspIndex]): Map<number, number[]> {

        let u_index = 0;
        let u = funnel[u_index];
        let w_index = funnel.length - 1;
        let w = funnel[w_index];

        let a = funnel[cuspIndex];
        let a_index = cuspIndex;

        let adjacentTriangles = this.getAdjacentTriangles(u, w);
        let unprocessed = this.setDifference(adjacentTriangles, processed);
        if (unprocessed.size != 1) {
            throw new Error("Unprocessed size was " + unprocessed.size + " but should be 1");
        }
        let triangle = [...unprocessed][0];
        let new_processed: Set<Triangle> = new Set([...processed, triangle]);
        // x is the third vertex of the triangle
        let x = [...this.setDifference(new Set(triangle), new Set([u, w]))][0];

        // Now, we check for intersections between xa and the funnel
        // and set v_index as the index of the point of intersection
        var v_index = this.findCuspIntersection(x, funnel, cuspIndex);

        // Split funnel U x into two new funnels
        // funnel1 = [u, ..., v, x]
        // funnel2 = [x, v, ..., w]
        var funnel1 = [...funnel.slice(0, v_index + 1), x];
        var funnel2 = [x, ...funnel.slice(v_index, funnel.length)];

        // Now, if v belongs to π(a, u),
        // set cuspIndex_f1 to v
        // and cuspIndex_f2 to a

        // Else, if v belongs to π(a, w),
        // set cuspIndex_f1 to a
        // and cuspIndex_f2 to v

        var cuspIndex_f1: number;
        var cuspIndex_f2: number;
        var newPathSoFar: number[];

        // Now we know that π(s, x) = π(s, v) U vx
        // So we record this new path.
        if (v_index < cuspIndex) {
            // Then v is on the u side of the funnel
            // and it belongs to π(a, u)
            cuspIndex_f1 = v_index;
            cuspIndex_f2 = a_index;
            newPathSoFar = [...pathSoFar, ...funnel.slice(v_index, a_index).reverse()];
        }
        else {
            cuspIndex_f1 = a_index;
            cuspIndex_f2 = v_index;
            newPathSoFar = [...pathSoFar, ...funnel.slice(a_index + 1, v_index + 1)];
        }


        var resultingPaths: Map<number, number[]> = new Map();
        resultingPaths.set(x, newPathSoFar);

        if (Math.abs(u_index - x) > 1) {
            resultingPaths = new Map(
                [...resultingPaths,
                ...this.PATH(funnel1, cuspIndex_f1, new_processed, newPathSoFar)]);
        }
        if (Math.abs(w_index - x) > 1) {
            resultingPaths = new Map(
                [...resultingPaths,
                ...this.PATH(funnel2, cuspIndex_f2, new_processed, newPathSoFar)]);
        }
        return resultingPaths;

    }

    findCuspIntersection(x: number, funnel: Array<number>, cuspIndex: number): number {
        let a = funnel[cuspIndex];
        let xa: LineSegment = [this.polygon[x], this.polygon[a]];
        for (let i = 0; i < funnel.length - 1; i++) {
            let segment: LineSegment = [this.polygon[funnel[i]], this.polygon[funnel[i + 1]]];
            if (LineSegmentIntersection(segment, xa)) {
                if (i < cuspIndex) {
                    // Then we're moving toward the cusp
                    // The tangent vertex is i+1
                    return i + 1;
                }
                else {
                    // Then we're moving away from the cusp
                    // The tangent vertex is i
                    return i;
                }
            }
        }
        return cuspIndex;
    }



    // This should not be necessary...
    setIntersect<T>(a: Set<T>, b: Set<T>) {
        return new Set([...a].filter((x) => { return b.has(x) }));
    }
    setDifference<T>(a: Set<T>, b: Set<T>) {
        return new Set([...a].filter((x) => { return !b.has(x) }));
    }

    getAdjacentTriangles(u: number, w: number): Set<Triangle> {
        let u_adj = this.triangulationMap.get(u);
        let w_adj = this.triangulationMap.get(w);
        if (u_adj === undefined) {
            throw new Error(u + " Not in triangulation");
        }
        if (w_adj === undefined) {
            throw new Error(w + " Not in triangulation");
        }

        var intersection = this.setIntersect(u_adj, w_adj);
        return intersection;
    }


    computeTriangulationMap(triangulation: Triangulation): Map<number, Set<Triangle>> {
        let tMap: Map<number, Set<Triangle>> = new Map();

        for (let i in triangulation) {
            let triangle = triangulation[i];
            for (let j in triangle) {
                let vertex = triangle[j];

                var mapValue = tMap.get(vertex);
                if (mapValue === undefined) {
                    tMap.set(vertex, new Set([triangle]));
                }
                else {
                    mapValue.add(triangle);
                }
            }
        }
        return tMap;
    }

    unflattenTriangulation(flat: Array<number>): Triangulation {
        var result: Triangulation = [];
        for (let index = 0; index < flat.length; index += 3) {
            let t: Triangle = [
                flat[index],
                flat[index + 1],
                flat[index + 2]
            ];
            result.push(t);
        }
        return result;
    }
}


export default ShortestPathTree;
