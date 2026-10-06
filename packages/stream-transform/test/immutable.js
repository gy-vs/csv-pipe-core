import "should";
import { transform, Transformer } from "../lib/index.js";

describe("immutable options", function () {
  it("accepts frozen options", function () {
    const options = Object.freeze({ parallel: 1 });
    const transformer = new Transformer(options, (record) => record);
    transformer.options.should.eql({
      parallel: 1,
      consume: false,
      objectMode: true,
      params: null,
    });
  });

  it("does not mutate user options", function () {
    const options = { parallel: 1 };
    new Transformer(options, (record) => record);
    options.should.eql({ parallel: 1 });
  });

  it("transforms records with frozen options", function (next) {
    const options = Object.freeze({ parallel: 1 });
    transform(
      ["a", "b"],
      options,
      (record) => record.toUpperCase(),
      (err, data) => {
        if (err) return next(err);
        data.should.eql(["A", "B"]);
        next();
      },
    );
  });
});
