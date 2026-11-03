// Checks that every tool's method and path (the rows in src/tools/endpoints.test.ts)
// exists in a pinned release of NombaOSS/openapi, and isn't marked deprecated there.
// To move to a newer spec: bump SPEC_VERSION, then replace SPEC_SHA256 with the new
// file's hash (shasum -a 256 openapi.json) after reading what changed.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const SPEC_VERSION = "v0.1.0";
const SPEC_URL = `https://github.com/NombaOSS/openapi/releases/download/${SPEC_VERSION}/openapi.json`;
const SPEC_SHA256 = "24dd0c2ec8eb197431c8538b1688a1accc2cda4cf8e50bf8ad4ee0b511b694ff";

const response = await fetch(SPEC_URL, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) {
  console.error(`Could not download ${SPEC_URL}: HTTP ${response.status}`);
  process.exit(1);
}
const raw = Buffer.from(await response.arrayBuffer());
const sha = createHash("sha256").update(raw).digest("hex");
if (sha !== SPEC_SHA256) {
  console.error(`Spec hash mismatch for ${SPEC_VERSION}: expected ${SPEC_SHA256}, got ${sha}`);
  process.exit(1);
}

const METHODS = ["get", "post", "put", "patch", "delete"];
const spec = JSON.parse(raw.toString("utf8"));
// "/v1/accounts/{subAccountId}/balance" and "/v1/accounts/sub1/balance" compare equal
const shape = (path) => path.replace(/\{[^}]*\}/g, "{}");
const operations = new Map();
for (const [path, item] of Object.entries(spec.paths ?? {})) {
  for (const method of METHODS) {
    if (item[method]) operations.set(`${method.toUpperCase()} ${shape(path)}`, item[method]);
  }
}

// The tests use concrete ids (sub1, ref1, glo), so try each trailing segment as a parameter.
function find(method, path) {
  const parts = path.split("/");
  const tail = parts.length - 3; // keep "", "v1", "accounts" literal
  for (let mask = 0; mask < 1 << Math.max(tail, 0); mask++) {
    const candidate = parts.map((p, i) => (i >= 3 && mask & (1 << (i - 3)) ? "{}" : p)).join("/");
    const op = operations.get(`${method} ${candidate}`);
    if (op) return op;
  }
  return undefined;
}

const source = readFileSync("src/tools/endpoints.test.ts", "utf8");
const table = source.slice(source.indexOf("const EXPECTED"), source.indexOf("];", source.indexOf("const EXPECTED")));
const rows = [
  ...table.matchAll(/"(nomba_\w+)"\s*,\s*\{[^}]*\}\s*,\s*"(GET|POST|PUT|PATCH|DELETE)"\s*,\s*"([^"]+)"/g),
];
if (rows.length < 30) {
  console.error(`Only found ${rows.length} rows in src/tools/endpoints.test.ts; has its format changed?`);
  process.exit(1);
}

const problems = [];
for (const [, tool, method, path] of rows) {
  const op = find(method, path);
  if (!op) problems.push(`${tool}: ${method} ${path} is not in the spec`);
  else if (op.deprecated) problems.push(`${tool}: ${method} ${path} is deprecated in the spec`);
}

if (problems.length) {
  console.error(`Spec check failed against ${SPEC_VERSION}:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`Spec check passed: ${rows.length} tool routes found in NombaOSS/openapi ${SPEC_VERSION}`);
