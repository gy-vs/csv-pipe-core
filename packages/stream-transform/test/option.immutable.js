import "should";
import { transform, Transformer } from "../lib/index.js";
import { transform as transformSync } from "../lib/sync.js";

const deepFreeze = function (object) {
  if (typeof object !== "object" || object === null) return object;
  Object.freeze(object);
  for (const key of Object.keys(object)) {
    deepFreeze(object[key]);
  }
  return object;
};

describe("Frozen and immutable options", function () {
  it("accept frozen options in the Transformer constructor", function () {
    const transformer = new Transformer(
      deepFreeze({ parallel: 1 }),
      (record) => record,
    );
    transformer.options.consume.should.eql(false);
    transformer.options.objectMode.should.eql(true);
    transformer.options.parallel.should.eql(1);
    (transformer.options.params === null).should.be.true();
  });

  it("accept frozen options in the sync API", function () {
    const data = transformSync(
      [["a"], ["b"]],
      deepFreeze({ parallel: 1 }),
      (record) => record + "!",
    );
    data.should.eql(["a!", "b!"]);
  });

  it("does not add normalized options to the user object", function () {
    const options = { parallel: 1 };
    new Transformer(options, (record) => record);
    Object.keys(options).should.eql(["parallel"]);
  });

  it("preserves the user provided `params` option", function () {
    const options = deepFreeze({ parallel: 1, params: { suffix: "!" } });
    const data = transformSync(
      [["a"]],
      options,
      (record, params) => record + params.suffix,
    );
    data.should.eql(["a!"]);
    Object.keys(options).sort().should.eql(["parallel", "params"]);
  });

  it("exposes the same normalized options as before", function () {
    const transformer = new Transformer({}, (record) => record);
    transformer.options.consume.should.eql(false);
    transformer.options.objectMode.should.eql(true);
    transformer.options.parallel.should.eql(100);
    (transformer.options.params === null).should.be.true();
  });

  it("works through the callback API with frozen options", function (next) {
    transform(
      [["a"], ["b"]],
      deepFreeze({ parallel: 1 }),
      (record, callback) => callback(null, record + "?"),
      (err, data) => {
        if (err) return next(err);
        data.should.eql(["a?", "b?"]);
        next();
      },
    );
  });
});
