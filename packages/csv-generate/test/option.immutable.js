import "should";
import { generate } from "../lib/sync.js";
import { generate as generateStream, Generator } from "../lib/index.js";

const deepFreeze = function (object) {
  if (typeof object !== "object" || object === null) return object;
  Object.freeze(object);
  for (const key of Object.keys(object)) {
    deepFreeze(object[key]);
  }
  return object;
};

describe("Frozen and immutable options", function () {
  it("accept frozen options in the sync API", function () {
    const options = deepFreeze({
      length: 1,
      columns: 2,
      seed: 1,
      object_mode: true,
    });
    const data = generate(options);
    data.should.be.an.Array();
    data.length.should.eql(1);
  });

  it("returns the same data as unfrozen options", function () {
    const options = { length: 4, columns: 2, seed: 1, objectMode: true };
    const unfrozen = generate(options);
    const frozen = generate(deepFreeze({ ...options }));
    frozen.should.eql(unfrozen);
  });

  it("does not add camelCase options to the user object", function () {
    const options = {
      length: 1,
      columns: 2,
      seed: 1,
      object_mode: true,
      high_water_mark: 16,
    };
    generate(options);
    Object.keys(options)
      .sort()
      .should.eql([
        "columns",
        "high_water_mark",
        "length",
        "object_mode",
        "seed",
      ]);
  });

  it("honors the underscored `object_mode` option and returns an array", function () {
    const data = generate(
      deepFreeze({ length: 3, object_mode: true, seed: 1 }),
    );
    data.should.be.an.Array();
    data.length.should.eql(3);
  });

  it("honors the underscored `high_water_mark` option", function () {
    const data = generate(
      deepFreeze({ length: 3, high_water_mark: 1, seed: 1 }),
    );
    data.should.be.a.String();
    data.split("\n").length.should.eql(3);
  });

  it("does not mutate a columns array of type names", function () {
    const columns = ["int", "bool"];
    generate({ length: 1, columns: columns, seed: 1 });
    columns.should.eql(["int", "bool"]);
  });

  it("exposes the same normalized options as before", function () {
    const generator = new Generator({
      length: 1,
      columns: 1,
      seed: 1,
      object_mode: true,
    });
    generator.options.objectMode.should.eql(true);
    ("object_mode" in generator.options).should.eql(false);
    generator.options.columns.length.should.eql(1);
    generator.options.columns[0].should.be.a.Function();
  });

  it("works through the callback API with frozen options", function (next) {
    generateStream(
      deepFreeze({ length: 1, columns: 1, seed: 1 }),
      (err, data) => {
        if (err) return next(err);
        data.should.be.instanceof(Buffer);
        next();
      },
    );
  });
});
