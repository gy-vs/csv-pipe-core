import "should";
import { stringify } from "../lib/index.js";

describe("immutable", function () {
  describe("cast", function () {
    it("accepts a frozen cast object", function (next) {
      const cast = Object.freeze({ number: (value) => `n${value}` });
      stringify([[1]], { cast }, (err, data) => {
        if (err) return next(err);
        data.should.eql("n1\n");
        Object.keys(cast).should.eql(["number"]);
        next();
      });
    });

    it("does not register default functions on the user cast object", function (next) {
      const cast = { number: (value) => `n${value}` };
      stringify([[1]], { cast }, (err, data) => {
        if (err) return next(err);
        data.should.eql("n1\n");
        Object.keys(cast).should.eql(["number"]);
        next();
      });
    });

    it("accepts a frozen object returned by cast", function (next) {
      stringify(
        [["a"]],
        {
          cast: {
            string: (value) => Object.freeze({ value: value, quoted: true }),
          },
        },
        (err, data) => {
          if (err) return next(err);
          data.should.eql('"a"\n');
          next();
        },
      );
    });
  });

  describe("columns", function () {
    it("accepts frozen column definitions", function (next) {
      const columns = Object.freeze([Object.freeze({ key: "a" })]);
      stringify([{ a: "1" }], { columns, header: true }, (err, data) => {
        if (err) return next(err);
        data.should.eql("a\n1\n");
        columns.should.eql([{ key: "a" }]);
        next();
      });
    });

    it("does not add the header property to the user column definitions", function (next) {
      const column = { key: "a" };
      stringify([{ a: "1" }], { columns: [column], header: true }, (err, data) => {
        if (err) return next(err);
        data.should.eql("a\n1\n");
        column.should.eql({ key: "a" });
        next();
      });
    });
  });

  describe("records", function () {
    it("accepts frozen records with fewer columns than fields", function (next) {
      const record = Object.freeze(["a", "b", "c"]);
      stringify([record], { columns: ["x", "y"] }, (err, data) => {
        if (err) return next(err);
        data.should.eql("a,b\n");
        next();
      });
    });

    it("does not truncate records to the columns length", function (next) {
      const records = [
        ["1", "a", "x"],
        ["2", "b", "y"],
      ];
      stringify(records, { columns: ["id", "name"] }, (err, data) => {
        if (err) return next(err);
        data.should.eql("1,a\n2,b\n");
        records.should.eql([
          ["1", "a", "x"],
          ["2", "b", "y"],
        ]);
        // The same records remain usable without the columns option
        stringify(records, {}, (err, data) => {
          if (err) return next(err);
          data.should.eql("1,a,x\n2,b,y\n");
          next();
        });
      });
    });
  });
});
