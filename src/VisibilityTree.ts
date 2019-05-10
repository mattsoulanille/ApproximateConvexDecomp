import { Polygon, Vector, Triangle, Triangulation, Graph, GraphNode, LineSegment } from "./PolygonTypes";
import earcut = require("earcut");
import { LineSegmentIntersection } from "./VectorFunctions";


class ShortestPathTree {
    polygon: Polygon;
    triangulation: Triangulation;
    //    dual: Graph<Triangle>; // The dual graph of the triangulation. Actually a tree.
    startVertex: Vector;

    // A map from vectors to their corresponding triangles in the triangulation.
    triangulationMap: Map<Vector, Set<Triangle>>;
    shortestPathMap: Map<Vector, Vector[]>;

    constructor(poly: Polygon, startVertex: Vector) {
        this.polygon = poly;
        this.startVertex = startVertex;

        var flattened = earcut.flatten([this.polygon]).vertices;
        var flattenedTriangulation = earcut(flattened);
        this.triangulation = this.unflattenTriangulation(flattenedTriangulation)
        //        this.dual = this.computeDual(this.triangulation);

        this.triangulationMap = this.computeTriangulationMap(this.triangulation);
        this.shortestPathMap = this.getShortestPaths();

    }



    // Finds a map from each vertex of P to the shortest path from startVertex to p
    getShortestPaths(): Map<Vector, Vector[]> {

        var startVertexIndex = this.polygon.indexOf(this.startVertex);
        var nextIndex = (startVertexIndex + 1) % this.polygon.length;
        var cuspIndex: number = 0;
        var funnel: Array<Vector> = [this.startVertex, this.polygon[nextIndex]];

        return this.PATH(funnel, cuspIndex);
    }

    PATH(funnel: Array<Vector>, cuspIndex: number, processed: Set<Triangle> = new Set(), pathSoFar: Array<Vector> = [this.polygon[cuspIndex]]): Map<Vector, Vector[]> {

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
        let new_processed = new Set([...processed, triangle]);
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
        var newPathSoFar: Vector[];

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


        var resultingPaths: Map<Vector, Vector[]> = new Map();
        resultingPaths.set(x, newPathSoFar);

        // This is O(n)! Fix me!
        var x_index = this.polygon.indexOf(x);
        if (Math.abs(u_index - x_index) > 1) {
            resultingPaths = new Map(
                [...resultingPaths,
                ...this.PATH(funnel1, cuspIndex_f1, new_processed, newPathSoFar)]);
        }
        if (Math.abs(w_index - x_index) > 1) {
            resultingPaths = new Map(
                [...resultingPaths,
                ...this.PATH(funnel2, cuspIndex_f2, new_processed, newPathSoFar)]);
        }
        return resultingPaths;

    }

    findCuspIntersection(x: Vector, funnel: Array<Vector>, cuspIndex: number) {
        let a = funnel[cuspIndex];
        let xa: LineSegment = [x, a];
        for (let i = 0; i < funnel.length; i++) {
            let segment: LineSegment = [funnel[i], funnel[i + 1]];
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

    getAdjacentTriangles(u: Vector, w: Vector): Set<Triangle> {
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


    computeTriangulationMap(triangulation: Triangulation): Map<Vector, Set<Triangle>> {
        let tMap: Map<Vector, Set<Triangle>> = new Map();

        for (let i in triangulation) {
            let triangle = triangulation[i];
            for (let j in triangle) {
                let vector = triangle[j];

                var mapValue = tMap.get(vector);
                if (mapValue === undefined) {
                    tMap.set(vector, new Set([triangle]));
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
                this.polygon[flat[index]],
                this.polygon[flat[index + 1]],
                this.polygon[flat[index + 2]]
            ];
            result.push(t);
        }
        return result;
    }

    // private sameLineSegment(l1: Vector, l2: Vector): boolean {
    //     return ((l1[0] == l2[0]) && (l1[1] == l2[1])) ||
    //         ((l1[0] == l2[1]) && (l1[1] == l2[0]));
    // }

    // The same line segments are guaranteed to be == since they were looked up from this.polygon.

    private dualEdgeToDiangonalUnsafe(t1: Triangle, t2: Triangle): Vector | null {
        for (let i = 0; i < 3; i++) {
            for (let j = i; j < 3; j++) {
                if (t1[i] == t2[j]) {
                    return t1[i];
                }
            }
        }
        return null
    }

    // Finds the corresponding diagonal to an edge in the dual graph
    // of a triangulation
    private dualEdgeToDiagonal(t1: Triangle, t2: Triangle): Vector {
        var res = this.dualEdgeToDiangonalUnsafe(t1, t2);
        if (res != null) {
            return res;
        }
        else {
            throw new Error(t1 + " and " + t2 + " are not adjacent triangles.");
        }
    }

    private trianglesAdjacent(t1: Triangle, t2: Triangle): boolean {
        return this.dualEdgeToDiangonalUnsafe(t1, t2) !== null;
    }

    computeDual(triangulation: Triangulation): Graph<Triangle> {
        let asGraph: Graph<Triangle> = new Set(triangulation.map(
            function(triangle) {
                return {
                    value: triangle,
                    neighbors: new Set<GraphNode<Triangle>>()
                }
            }));

        // Add edges to the graph
        let l = [...asGraph]
        for (let i = 0; i < l.length; i++) {
            let node_i = l[i];
            for (let j = i; j < l.length; j++) {

                // No triangle has more than 3 neighbors
                // Makes it better than O(n^2) I think?
                if (node_i.neighbors.size == 3) {
                    break;
                }

                // Assign neighbors
                let node_j = l[j];
                if (this.trianglesAdjacent(node_i.value, node_j.value)) {
                    node_i.neighbors.add(node_j);
                    node_j.neighbors.add(node_i);
                }
            }
        }
        return asGraph;
    }

    // Only applies to graphs that are trees! O(n)
    // If you want to support polygons with holes,
    // this will need to be modified to find the shortest path.
    // As it stands, there is only one path since the dual of
    // a triangulation of a holeless polygon is a tree.
    getPathInTree<T>(a: GraphNode<T>, b: GraphNode<T>): Array<GraphNode<T>> {
        var paths: Array<Array<GraphNode<T>>> = [[a]];
        while (paths.length != 0) {
            // Base case: Check if we arrived at b
            for (let pathIndex in paths) {
                var path = paths[pathIndex];
                if (path[path.length - 1] == b) {
                    return path;
                }
            }


            var newPaths: Array<Array<GraphNode<T>>> = [];
            // Inductive step: Extend the path by 1
            for (let pathIndex in paths) {
                var path = paths[pathIndex];
                var last = path[path.length - 1];

                // Avoid doubling back on yourself
                var secondLast: GraphNode<T> | null;
                if (path.length >= 2) {
                    secondLast = path[path.length - 1];
                }
                else {
                    secondLast = null;
                }

                // Don't consider where we came from.
                var neighbors = [...last.neighbors].filter((neighbor) => { return neighbor != secondLast });
                for (let i in neighbors) {
                    var neighbor = neighbors[i];
                    newPaths.push([...path, neighbor]); // Extend the current path with the neighbor
                }
            }
            paths = newPaths;

        }
        throw new Error("Did not find a path between " + a + " and " + b);
    }
}


export default ShortestPathTree;
