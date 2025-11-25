import { describe, it, expect } from "vitest";
import {
  buildQueryFromFilterSegments,
  toggleCommaToken,
} from "./filters";

describe("buildQueryFromFilterSegments", () => {
  it("should return empty string for empty segments", () => {
    expect(buildQueryFromFilterSegments([])).toBe("");
    expect(buildQueryFromFilterSegments(null)).toBe("");
    expect(buildQueryFromFilterSegments(undefined)).toBe("");
  });

  it("should convert duration filters", () => {
    const segments = ["dur-gte-90", "dur-lte-180"];
    const result = buildQueryFromFilterSegments(segments);
    expect(result).toContain("durationMin=90");
    expect(result).toContain("durationMax=180");
  });

  it("should convert date range filter", () => {
    const segments = ["date-2020-01-01_2021-12-31"];
    const result = buildQueryFromFilterSegments(segments);
    expect(result).toContain("releasedStart=2020-01-01");
    expect(result).toContain("releasedEnd=2021-12-31");
  });

  it("should convert genre filter", () => {
    const segments = ["genre-acao,aventura"];
    const result = buildQueryFromFilterSegments(segments);
    expect(result).toContain("genres=acao,aventura");
  });

  it("should convert vote filter", () => {
    const segments = ["vote-gte-70"];
    const result = buildQueryFromFilterSegments(segments);
    expect(result).toContain("voteMin=70");
  });

  it("should convert search filter", () => {
    const segments = ["search-bumblebee"];
    const result = buildQueryFromFilterSegments(segments);
    expect(result).toContain("search=bumblebee");
  });

  it("should handle multiple filters", () => {
    const segments = [
      "dur-gte-90",
      "date-2020-01-01_2021-01-01",
      "genre-acao,aventura",
    ];
    const result = buildQueryFromFilterSegments(segments);
    expect(result).toContain("durationMin=90");
    expect(result).toContain("releasedStart=2020-01-01");
    expect(result).toContain("releasedEnd=2021-01-01");
    expect(result).toContain("genres=acao,aventura");
  });

  it("should handle date filter with only start date", () => {
    const segments = ["date-2020-01-01_"];
    const result = buildQueryFromFilterSegments(segments);
    expect(result).toContain("releasedStart=2020-01-01");
    expect(result).not.toContain("releasedEnd");
  });
});

describe("toggleCommaToken", () => {
  it("should add token if not present", () => {
    expect(toggleCommaToken("acao,aventura", "ficcao")).toBe(
      "acao,aventura,ficcao"
    );
  });

  it("should remove token if present", () => {
    expect(toggleCommaToken("acao,aventura,ficcao", "aventura")).toBe(
      "acao,ficcao"
    );
  });

  it("should handle empty string", () => {
    expect(toggleCommaToken("", "acao")).toBe("acao");
  });

  it("should handle single token", () => {
    expect(toggleCommaToken("acao", "acao")).toBe("");
    expect(toggleCommaToken("acao", "aventura")).toBe("acao,aventura");
  });
});

