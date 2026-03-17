#!/usr/bin/env node
/**
 * Read JSON from add-web-features.js (from file or stdin).
 * Output only entries where all webFeatures are non-null, share the same
 * baselineStatus, and map to multiple distinct feature IDs (multiple web
 * features that happen to have the same status).
 * Exclude any entry that has a null in webFeatures or where all keys map to
 * the same feature ID.
 */

import fs from "node:fs";

function hasSameNonnullBaselineMultipleFeatures(entry) {
  if (entry.webFeatures.some((wf) => wf === null)) return false;
  const statuses = entry.webFeatures.map((wf) => wf.baselineStatus);
  const distinctStatuses = new Set(statuses);
  if (distinctStatuses.size !== 1) return false;
  const ids = entry.webFeatures.map((wf) => wf.id);
  const distinctIds = new Set(ids);
  return distinctIds.size > 1;
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
  const filtered = data.filter(hasSameNonnullBaselineMultipleFeatures);
  console.log(JSON.stringify(filtered, null, 2));
}

main();
