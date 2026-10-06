import "should";
import { generate } from "../lib/index.js";
import { generate as generate_sync } from "../lib/sync.js";

describe("immutable options", function () {
  it("sync accepts frozen options", function () {
    const options = Object.freeze({
      length: 1,
      columns: 2,
      seed: 1,
      object_mode: true,
    });
    const records = generate_sync(options);
    records.should.be.an.Array();
    records.length.should.eql(1);
    records[0].length.should.eql(2);
  });

  it("sync does not mutate user options", function () {
    const options = { length: 1, columns: 2, seed: 1, object_mode: true };
    const records = generate_sync(options);
    records.should.be.an.Array();
    options.should.eql({ length: 1, columns: 2, seed: 1, object_mode: true });
  });

  it("sync honors underscored high_water_mark", function () {
    const options = Object.freeze({
      length: 2,
      columns: 2,
      seed: 1,
      high_water_mark: 1024,
    });
    const data = generate_sync(options);
    data.should.be.a.String();
    data.split(/\n/).length.should.eql(2);
  });

  it("async accepts frozen options", function (next) {
    const options = Object.freeze({
      length: 2,
      columns: 2,
      seed: 1,
      object_mode: true,
    });
    generate(options, (err, records) => {
      if (err) return next(err);
      records.length.should.eql(2);
      options.should.eql({ length: 2, columns: 2, seed: 1, object_mode: true });
      next();
    });
  });

  it("async does not mutate user options", function (next) {
    const options = { length: 2, columns: 2, seed: 1, object_mode: true };
    generate(options, (err, records) => {
      if (err) return next(err);
      records.length.should.eql(2);
      options.should.eql({ length: 2, columns: 2, seed: 1, object_mode: true });
      next();
    });
  });
});
