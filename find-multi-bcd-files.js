#!/usr/bin/env node
/**
 * Find all .md files that have multiple browser-compat keys in front matter.
 * Outputs JSON array: [{ path, bcdKeys }, ...]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILES_ROOT = path.join(__dirname, "files");

function* walkMdFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkMdFiles(full);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      yield full;
    }
  }
}

function getBrowserCompatKeys(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  if (!content.startsWith("---\n")) {
    return null;
  }
  const end = content.indexOf("\n---", 4);
  if (end === -1) return null;
  const yamlStr = content.slice(4, end);
  const fm = YAML.parse(yamlStr);
  if (!fm || !("browser-compat" in fm)) return null;
  const bc = fm["browser-compat"];
  const keys = Array.isArray(bc) ? bc : bc ? [bc] : [];
  return keys.filter((k) => typeof k === "string" && k.length > 0);
}

const results = [];
for (const filePath of walkMdFiles(FILES_ROOT)) {
  const keys = getBrowserCompatKeys(filePath);
  if (keys && keys.length > 1) {
    const relativePath = path.relative(__dirname, filePath);
    results.push({ path: relativePath, bcdKeys: keys });
  }
}

console.log(JSON.stringify(results, null, 2));
