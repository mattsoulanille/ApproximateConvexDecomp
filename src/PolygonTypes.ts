type Vector = [number, number];
type Polygon = Array<Vector>;
type Triangle = [number, number, number]
type Triangulation = Array<Triangle>

type LineSegment = [Vector, Vector]

type GraphNode<T> = {
    neighbors: Set<GraphNode<T>>,
    value: T
}

type Graph<T> = Set<GraphNode<T>>;

type ConcavityMeasure = {
    value: number,
    witnessIndex: number
}


export { Vector, Polygon, ConcavityMeasure, Triangle, Triangulation, GraphNode, Graph, LineSegment };
