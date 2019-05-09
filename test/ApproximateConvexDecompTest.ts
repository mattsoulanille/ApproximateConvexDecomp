import "mocha";
import * as chai from "chai";

import ApproximateConvexDecomp from "../src/ApproximateConvexDecomp";

before(function() {
    chai.should();
});



describe("ApproximateConvexDecomp", function() {
    it("Remove this test", function() {
        ApproximateConvexDecomp([1, 2, 3]).should.deep.equal([]);
    });
});