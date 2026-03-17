#!/usr/bin/env node
/**
 * Read JSON from add-web-features.js (from file or stdin).
 * Output only entries where webFeatures show a mix of baseline statuses:
 * - mix of null and non-null (some BCD keys have no feature, others do), or
 * - mix of different baselineStatus values (e.g. "high" vs "low" vs false).
 * Exclude: all web features null, or all same baselineStatus.
 */

import fs from "node:fs";

function hasMixedBaselineStatuses(entry) {
  const statuses = entry.webFeatures.map((wf) =>
    wf === null ? null : wf.baselineStatus,
  );
  const distinct = new Set(statuses);
  return distinct.size > 1;
}

function main() {
  let input;
  if (process.argv[2]) {
    input = fs.readFileSync(process.argv[2], "utf-8");
  } else {
    input = fs.readFileSync(0, "utf-8");
  }
  const data = JSON.parse(input);
  if (!Array.isArray(data)) {
    throw new Error("Expected JSON array input");
  }
  const filtered = data.filter(hasMixedBaselineStatuses);
  console.log(JSON.stringify(filtered, null, 2));
}

main();
