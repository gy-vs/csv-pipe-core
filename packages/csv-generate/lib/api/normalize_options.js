import { types } from "./types.js";

const camelize = function (str) {
  return str.replace(/_([a-z])/gi, function (_, match) {
    return match.toUpperCase();
  });
};

const normalize_options = (opts) => {
  // Clone and camelize options. Underscored options like `object_mode` and
  // `high_water_mark` are converted to their camelCase counterparts. The
  // caller's object is never mutated, it may be frozen or reused.
  const options = {};
  for (const k in opts) {
    options[camelize(k)] = opts[k];
  }
  // Normalize options
  const dft = {
    columns: 8,
    delimiter: ",",
    duration: null,
    encoding: null,
    end: null,
    eof: false,
    fixedSize: false,
    length: -1,
    maxWordLength: 16,
    rowDelimiter: "\n",
    seed: false,
    sleep: 0,
  };
  for (const k in dft) {
    if (options[k] === undefined) {
      options[k] = dft[k];
    }
  }
  // Default values
  if (options.eof === true) {
    options.eof = options.rowDelimiter;
  }
  if (typeof options.columns === "number") {
    options.columns = new Array(options.columns);
  }
  // Clone the columns array so the caller's array is never mutated when
  // string type names are replaced by their generator functions
  options.columns = [...options.columns];
  const accepted_header_types = Object.keys(types).filter(
    (t) => !["super_", "camelize"].includes(t),
  );
  for (let i = 0; i < options.columns.length; i++) {
    const v = options.columns[i] || "ascii";
    if (typeof v === "string") {
      if (!accepted_header_types.includes(v)) {
        throw Error(
          `Invalid column type: got "${v}", default values are ${JSON.stringify(accepted_header_types)}`,
        );
      }
      options.columns[i] = types[v];
    }
  }
  return options;
};

export { normalize_options };
