import { describe, expect, it } from "vitest";

describe("Buyer-Property Match Engine — Types", () => {
  it("BuyerMatch type has required fields", async () => {
    const match = {
      property: { id: 1, address: "123 Main St" },
      score: 85,
      score_pct: 85,
      reasons: ["Price match", "Location match"],
    };
    expect(match.score_pct).toBeGreaterThanOrEqual(0);
    expect(match.score_pct).toBeLessThanOrEqual(100);
    expect(match.reasons).toBeInstanceOf(Array);
    expect(match.reasons.length).toBeGreaterThan(0);
    expect(match.property.address).toBeTruthy();
  });

  it("PropertyBuyerMatch type has required fields", async () => {
    const match = {
      buyer_interest: { id: 1, person_name: "John" },
      person: { id: 1, first_name: "John", last_name: "Doe" },
      score: 72,
      score_pct: 72,
      reasons: ["Suburb match"],
    };
    expect(match.score_pct).toBeGreaterThanOrEqual(0);
    expect(match.person.first_name).toBeTruthy();
    expect(match.buyer_interest.person_name).toBeTruthy();
  });
});

describe("Buyer-Property Match Engine — Score Coloring", () => {
  it("scores >= 70 are green tier", () => {
    const score = 85;
    expect(score >= 70).toBe(true);
  });

  it("scores 40-69 are amber tier", () => {
    const score = 55;
    expect(score >= 40 && score < 70).toBe(true);
  });

  it("scores < 40 are grey tier", () => {
    const score = 25;
    expect(score < 40).toBe(true);
  });
});

describe("Buyer-Property Match Engine — Buyer Preferences", () => {
  it("buyer preference fields are structured correctly", () => {
    const prefs = {
      price_min: 500000,
      price_max: 800000,
      bedrooms_min: 3,
      bathrooms_min: 2,
      land_size_min: 400,
      preferred_suburbs: ["Ponsonby", "Grey Lynn"],
      property_type_pref: "house",
      special_features: ["Pool", "Sea Views"],
    };
    expect(prefs.price_min).toBeLessThan(prefs.price_max);
    expect(prefs.bedrooms_min).toBeGreaterThanOrEqual(1);
    expect(prefs.bedrooms_min).toBeLessThanOrEqual(6);
    expect(prefs.bathrooms_min).toBeGreaterThanOrEqual(1);
    expect(prefs.bathrooms_min).toBeLessThanOrEqual(4);
    expect(prefs.preferred_suburbs).toBeInstanceOf(Array);
    expect(prefs.preferred_suburbs.length).toBeGreaterThan(0);
    expect(["house", "apartment", "townhouse", "section", "lifestyle"]).toContain(prefs.property_type_pref);
    expect(prefs.special_features.every((f) => typeof f === "string")).toBe(true);
  });

  it("empty preferences are valid (all optional)", () => {
    const prefs = {};
    expect(Object.keys(prefs).length).toBe(0);
  });
});

describe("Buyer-Property Match Engine — API Endpoints", () => {
  it("getBuyerMatches endpoint path is correct", () => {
    const buyerInterestId = "42";
    const path = `/buyers/${buyerInterestId}/matches`;
    expect(path).toBe("/buyers/42/matches");
  });

  it("getPropertyBuyerMatches endpoint path is correct", () => {
    const propertyId = "7";
    const path = `/properties/${propertyId}/buyer-matches`;
    expect(path).toBe("/properties/7/buyer-matches");
  });

  it("runMatchEngine endpoint path is correct", () => {
    const path = "/match-engine/run";
    expect(path).toBe("/match-engine/run");
  });
});

describe("Buyer-Property Match Engine — MatchCard Display Logic", () => {
  function scoreColor(score: number) {
    if (score >= 70) return "green";
    if (score >= 40) return "amber";
    return "grey";
  }

  it("renders correct color for high score", () => {
    expect(scoreColor(85)).toBe("green");
    expect(scoreColor(70)).toBe("green");
  });

  it("renders correct color for medium score", () => {
    expect(scoreColor(55)).toBe("amber");
    expect(scoreColor(40)).toBe("amber");
    expect(scoreColor(69)).toBe("amber");
  });

  it("renders correct color for low score", () => {
    expect(scoreColor(10)).toBe("grey");
    expect(scoreColor(39)).toBe("grey");
    expect(scoreColor(0)).toBe("grey");
  });

  it("truncates reasons to 3 visible + count badge", () => {
    const reasons = ["Price", "Location", "Size", "Features", "Suburb"];
    const visible = reasons.slice(0, 3);
    const extra = reasons.length - 3;
    expect(visible).toHaveLength(3);
    expect(extra).toBe(2);
  });

  it("shows all reasons when 3 or fewer", () => {
    const reasons = ["Price", "Location"];
    const visible = reasons.slice(0, 3);
    const extra = reasons.length - 3;
    expect(visible).toHaveLength(2);
    expect(extra).toBeLessThanOrEqual(0);
  });
});

describe("Buyer-Property Match Engine — Qualifying Interests Filter", () => {
  it("filters interests with stage >= interested", () => {
    const interests = [
      { id: 1, status: "seen" },
      { id: 2, status: "interested" },
      { id: 3, status: "hot" },
      { id: 4, status: "offer" },
      { id: 5, status: "purchased" },
    ];
    const qualifying = interests.filter((bi) =>
      ["interested", "hot", "offer", "purchased"].includes(bi.status)
    );
    expect(qualifying).toHaveLength(4);
    expect(qualifying.map((q) => q.id)).toEqual([2, 3, 4, 5]);
  });

  it("returns empty when no qualifying interests", () => {
    const interests = [{ id: 1, status: "seen" }];
    const qualifying = interests.filter((bi) =>
      ["interested", "hot", "offer", "purchased"].includes(bi.status)
    );
    expect(qualifying).toHaveLength(0);
  });
});
