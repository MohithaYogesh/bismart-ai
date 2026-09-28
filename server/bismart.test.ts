import { describe, expect, it } from "vitest";
import { answerWithFallback, demoScanResult, recommendStandard, retrieveKnowledge } from "./bismart-data";

describe("BISmart knowledge fallback", () => {
  it("retrieves product-certification guidance for a manufacturer query", () => {
    const results = retrieveKnowledge("What documents and testing are needed for certification?");
    expect(results[0]?.entry.title).toContain("certification");
  });

  it("uses safe uncertainty language for unsupported queries", () => {
    const result = answerWithFallback("Explain the xylophone alchemist protocol");
    expect(result.response).toContain("could not find sufficient verified information");
  });

  it("does not fabricate a standard number", () => {
    const result = recommendStandard("Pressure Cooker", "Domestic stovetop model");
    expect(result.result.standardNumber).toBeNull();
    expect(result.result.note).toContain("verify with official BIS source");
  });

  it("returns explainable claim states for the demo scan", () => {
    const result = demoScanResult();
    expect(result.claims.map((claim) => claim.status)).toEqual([
      "SUPPORTED",
      "CANNOT_VERIFY",
      "POTENTIALLY_NOT_SUPPORTED",
    ]);
    expect(result.extracted.barcode).toContain("authenticity not confirmed");
  });
});
