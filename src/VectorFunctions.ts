import { Vector, LineSegment } from "./PolygonTypes";

function Cross(v1: Vector, v2: Vector) {
    return v1[0] * v2[1] - v1[1] * v2[0];
}


function VectorDifference(v1: Vector, v2: Vector): Vector {
    return [v1[0] - v2[0], v1[1] - v2[1]];
}


// The following function is from https://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
function BoundingBoxesIntersect(a: LineSegment, b: LineSegment): boolean {
    return a[0][0] <= b[1][0]
        && a[1][0] >= b[0][0]
        && a[0][1] <= b[1][1]
        && a[1][1] >= b[0][1];
}



// Adapted from https://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
function LineSegmentIntersectLine(s1: LineSegment, s2: LineSegment): boolean {
    let origin = s1[0];

    function diff(v: Vector): Vector {
        return VectorDifference(v, origin);
    }

    let s1_translated = s1.map(diff);
    let s2_translated = s2.map(diff);

    let c1 = Cross(s2_translated[0], s1_translated[1]);
    let c2 = Cross(s2_translated[1], s1_translated[1]);

    if (c1 == 0 || c2 == 0) {
        return true;
    }

    // Both cross products were in the same angular direction
    if (c1 * c2 > 0) {
        return true;
    }
    return false;
}

// Adapted from https://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
function LineSegmentIntersection(s1: LineSegment, s2: LineSegment): boolean {

    if (!BoundingBoxesIntersect(s1, s2)) {
        return false;
    }

    return (LineSegmentIntersectLine(s1, s2) && LineSegmentIntersectLine(s2, s1));

}

export { LineSegmentIntersection };
