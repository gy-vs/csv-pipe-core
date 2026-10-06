import "should";
import { stringify, Stringifier } from "../lib/index.js";
import { stringify as stringifySync } from "../lib/sync.js";

const deepFreeze = function (object) {
  if (typeof object !== "object" || object === null) return object;
  Object.freeze(object);
  for (const key of Object.keys(object)) {
    deepFreeze(object[key]);
  }
  return object;
};

describe("Frozen and immutable inputs", function () {
  it("accept a frozen `cast` option", function () {
    const cast = deepFreeze({ number: (value) => "n" + value });
    stringifySync([[1]], { cast: cast }).should.eql("n1\n");
    // Only the user provided function is present on the source object
    Object.keys(cast).should.eql(["number"]);
  });

  it("accept frozen column definitions with `header`", function () {
    const columns = deepFreeze([{ key: "a" }]);
    stringifySync([{ a: 1 }], { columns: columns, header: true }).should.eql(
      "a\n1\n",
    );
    columns.should.eql([{ key: "a" }]);
  });

  it("accept frozen records shorter than `columns`", function () {
    const records = deepFreeze([["a", "b", "c"]]);
    stringifySync(records, { columns: ["x", "y"] }).should.eql("a,b\n");
    records.should.eql([["a", "b", "c"]]);
  });

  it("does not mutate records when `columns` truncates them", function () {
    const records = [
      [1, "john", "x"],
      [2, "sam", "y"],
    ];
    stringifySync(records, { columns: ["id", "name"] }).should.eql(
      "1,john\n2,sam\n",
    );
    // The same records can be stringified again with all their columns
    stringifySync(records).should.eql("1,john,x\n2,sam,y\n");
  });

  it("does not enrich the user `cast` object with defaults", function () {
    const cast = { number: (value) => "n" + value };
    stringifySync([[1]], { cast: cast });
    Object.keys(cast).should.eql(["number"]);
  });

  it("does not enrich the user column definitions with `header`", function () {
    const columns = [{ key: "a" }];
    stringifySync([{ a: 1 }], { columns: columns, header: true });
    columns.should.eql([{ key: "a" }]);
  });

  it("does not mutate the object returned by a cast function", function () {
    const casted = Object.freeze({ value: "a,b", quoted: true });
    stringifySync([[1]], {
      cast: { number: () => casted },
    }).should.eql('"a,b"\n');
  });

  it("exposes the same normalized options as with unfrozen inputs", function () {
    const stringifier = new Stringifier({
      cast: { number: (value) => "n" + value },
      columns: [{ key: "a" }],
    });
    Object.keys(stringifier.options.cast)
      .sort()
      .should.eql(["bigint", "boolean", "date", "number", "object", "string"]);
    stringifier.options.columns.should.eql([{ key: "a", header: "a" }]);
  });

  it("works through the callback API with frozen arguments", function (next) {
    const records = deepFreeze([
      ["a", "b", "c"],
      ["d", "e", "f"],
    ]);
    stringify(records, deepFreeze({ columns: ["x", "y"] }), (err, data) => {
      if (err) return next(err);
      data.should.eql("a,b\nd,e\n");
      records.should.eql([
        ["a", "b", "c"],
        ["d", "e", "f"],
      ]);
      next();
    });
  });
});
