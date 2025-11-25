import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (classNames utility)", () => {
  it("should combine multiple classes", () => {
    expect(cn("class1", "class2", "class3")).toBe("class1 class2 class3");
  });

  it("should filter out falsy values", () => {
    expect(cn("class1", false, "class2", null, undefined, "class3")).toBe(
      "class1 class2 class3"
    );
  });

  it("should handle empty input", () => {
    expect(cn()).toBe("");
  });

  it("should handle only falsy values", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

