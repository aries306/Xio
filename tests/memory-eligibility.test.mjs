import test from "node:test";
import assert from "node:assert/strict";
import { evaluateMemory } from "../src/lib/zuna/memory-eligibility.ts";

const NOW = Date.parse("2026-11-03T12:00:00.000Z");
const contexts = [{ id: "ctx-product", name: "Product strategy" }];
const base = {
  id: "mem-1",
  lifecycle: "active",
  confidence: 0.88,
  scope: { contexts: ["ctx-product"] },
  provenance: {
    type: "conversation",
    userId: "user-1",
    conversationId: "conversation-1",
    capturedAt: "2026-11-02T12:00:00.000Z"
  },
  original_context_id: "ctx-old",
  created_at: "2026-11-02T12:00:00.000Z",
  updated_at: "2026-11-02T12:00:00.000Z",
  last_revalidated_at: "2026-11-02T12:00:00.000Z"
};

test("active, sourced, fresh memory in a matching context is eligible", () => {
  assert.deepEqual(evaluateMemory(base, contexts, NOW), {
    eligible: true, status: "eligible", reasons: []
  });
});

test("dormant memory that matches a returning context is a candidate, not an influence", () => {
  const result = evaluateMemory({ ...base, lifecycle: "dormant" }, contexts, NOW);
  assert.equal(result.eligible, false);
  assert.equal(result.status, "dormant_candidate");
});

test("review memories never enter the reasoning prompt", () => {
  const result = evaluateMemory({ ...base, lifecycle: "review" }, contexts, NOW);
  assert.equal(result.eligible, false);
  assert.equal(result.status, "review_candidate");
});

test("missing or malformed provenance fails closed", () => {
  for (const provenance of [null, {}, { type: "conversation", capturedAt: "invalid" }]) {
    const result = evaluateMemory({ ...base, provenance }, contexts, NOW);
    assert.equal(result.eligible, false);
    assert.equal(result.status, "insufficient_provenance");
  }
});

test("out-of-scope memories cannot influence a different context", () => {
  const result = evaluateMemory({ ...base, scope: { contexts: ["ctx-finance"] } }, contexts, NOW);
  assert.equal(result.eligible, false);
  assert.equal(result.status, "out_of_scope");
});

test("low confidence memories require review", () => {
  const result = evaluateMemory({ ...base, confidence: 0.2 }, contexts, NOW);
  assert.equal(result.eligible, false);
  assert.equal(result.status, "low_confidence");
});

test("stale or missing revalidation timestamps fail closed", () => {
  for (const overrides of [
    { last_revalidated_at: null, updated_at: null, created_at: null },
    { last_revalidated_at: "2025-01-01T00:00:00.000Z" },
    { last_revalidated_at: "not-a-date", updated_at: null, created_at: null },
  ]) {
    const result = evaluateMemory({ ...base, ...overrides }, contexts, NOW);
    assert.equal(result.eligible, false);
    assert.equal(result.status, "stale");
  }
});

test("a matching original context can reactivate retrieval candidacy", () => {
  const result = evaluateMemory({
    ...base, lifecycle: "dormant", scope: {}, original_context_id: "ctx-product"
  }, contexts, NOW);
  assert.equal(result.status, "dormant_candidate");
  assert.equal(result.eligible, false);
});
