import { Polygon, ConcavityMeasure } from "./PolygonTypes";

// function ApproximateConvexDecomp(poly: Polygon, tau: number,
//     concavityMetric: (p: Polygon) => ConcavityMeasure = shortestPathConcavityMetric): Array<Polygon> {

//     let c = concavityMetric(poly);
//     if (c.value < tau) {
//         return [poly];
//     }
//     else {
//         Resolve(poly, c.witnessIndex)
//     }
// }

//function Resolve(poly: Polygon, witnessIndex: number): Array<Polygon> {
// Deviates from the paper and does not handle polygons with holes!

//}

//function shortestPathConcavityMetric(poly: Polygon): ConcavityMeasure {
// See section 5.1.2 of Approximate convex decomposition of polygons
// Algorithm 5.1
//	return {

//}


//export default ApproximateConvexDecomp;