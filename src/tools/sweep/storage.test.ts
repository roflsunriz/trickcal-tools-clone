import { describe, expect, it } from "vitest";
import data from "./data.json";
import { sanitizeSelectedQuantities, sanitizeSelectedRanks } from "./storage";
import type { SweepData } from "./types";

const sweepData = data as SweepData;

describe("sweep storage repair", () => {
  it("drops invalid selected materials and quantities", () => {
    const selected = sanitizeSelectedQuantities(
      {
        "material-078": 46,
        "missing-material": 10,
        "material-079": -1,
        "material-080": "bad",
      },
      sweepData,
    );

    expect(Object.fromEntries(selected)).toEqual({ "material-078": 46 });
  });

  it("repairs invalid rank filters to all ranks", () => {
    expect(Array.from(sanitizeSelectedRanks("bad", [1, 2, 3]))).toEqual([1, 2, 3]);
  });

  it("drops out-of-range rank filters", () => {
    expect(Array.from(sanitizeSelectedRanks([1, 9, "bad", 2], [1, 2, 3]))).toEqual([1, 2]);
  });
});
