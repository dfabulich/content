#!/usr/bin/env node
/**
 * Consume JSON from find-multi-bcd-files.js (from file or stdin).
 * For each BCD key, resolve the corresponding web-features feature.
 * Outputs same structure with an additional webFeatures array per entry.
 * - One feature per BCD key -> add that feature id.
 * - No feature for a BCD key -> add null.
 * - Multiple features for the same BCD key -> throw.
 */

import fs from "node:fs";
import { features } from "web-features";

/** Build map: BCD key -> array of web-features feature ids */
function buildBcdToFeaturesMap() {
  const map = Object.create(null);
  for (const [featureId, feature] of Object.entries(features)) {
    const compat = feature.compat_features;
    if (!compat) continue;
    for (const bcdKey of compat) {
      if (!map[bcdKey]) map[bcdKey] = [];
      map[bcdKey].push(featureId);
    }
  }
  return map;
}

const bcdToFeatures = buildBcdToFeaturesMap();

function getWebFeaturesForEntry(entry) {
  const webFeatures = [];
  for (const bcdKey of entry.bcdKeys) {
    const ids = bcdToFeatures[bcdKey];
    if (!ids || ids.length === 0) {
      webFeatures.push(null);
    } else if (ids.length > 1) {
      throw new Error(
        `BCD key "${bcdKey}" maps to multiple web-features: ${ids.join(", ")}`,
      );
    } else {
      const id = ids[0];
      const feature = features[id];
      const baselineStatus =
        feature &&
        feature.status &&
        typeof feature.status.baseline !== "undefined"
          ? feature.status.baseline
          : null;
      webFeatures.push({ id, baselineStatus });
    }
  }
  return webFeatures;
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
  const result = data.map((entry) => ({
    path: entry.path,
    bcdKeys: entry.bcdKeys,
    webFeatures: getWebFeaturesForEntry(entry),
  }));
  console.log(JSON.stringify(result, null, 2));
}

main();
