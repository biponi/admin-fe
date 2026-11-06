/**
 * One-off: extract BDDivisions / BDDistrictList / BDDeliveryCharge from
 * src/utils/contents.tsx into a JSON file the backend can seed from.
 *
 * Usage: node scripts/extract-locations.mjs
 * Output: ../biponi-express/scripts/data/bd-locations.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentsPath = resolve(__dirname, "../src/utils/contents.tsx");
const outPath = resolve(
  __dirname,
  "../../biponi-express/scripts/data/bd-locations.json",
);

const source = readFileSync(contentsPath, "utf8");

/**
 * Pull an exported array literal (of plain object literals) out of the TSX
 * source by brace-matching. Avoids needing a TS parser for this one-off job.
 */
function extractArray(constName) {
  const declIdx = source.indexOf(`export const ${constName}`);
  if (declIdx === -1) throw new Error(`${constName} not found`);
  const openIdx = source.indexOf("[", declIdx);
  let depth = 0;
  let end = -1;
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error(`${constName}: unmatched brackets`);
  // TS object literals → JSON: quote unquoted keys, drop trailing commas
  const body = source
    .slice(openIdx, end + 1)
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3')
    .replace(/,\s*([\]}])/g, "$1");
  try {
    return JSON.parse(body);
  } catch (e) {
    throw new Error(`${constName}: ${e.message}`);
  }
}

const divisions = extractArray("BDDivisions");
const districts = extractArray("BDDistrictList");
const charges = extractArray("BDDeliveryCharge");

const chargeByDistrictId = new Map(charges.map((c) => [c.district_id, c]));
const categories = [...new Set(charges.map((c) => c.category))];

// Sanity: a category should have one uniform charge; warn if not
const chargeByCategory = {};
for (const c of charges) {
  (chargeByCategory[c.category] ||= new Set()).add(c.deliveryCharge);
}
for (const [cat, vals] of Object.entries(chargeByCategory)) {
  if (vals.size > 1)
    console.warn(
      `WARNING: category "${cat}" has mixed charges: ${[...vals].join(", ")}`,
    );
}

const districtsWithCharge = districts.map((d) => {
  const charge = chargeByDistrictId.get(d.id);
  return {
    sourceId: d.id,
    divisionId: d.division_id,
    division:
      divisions.find((dv) => dv.id === d.division_id)?.name || "Unknown",
    name: d.name,
    bnName: d.bn_name || "",
    lat: d.lat || "",
    long: d.long || "",
    charge: charge?.deliveryCharge ?? null,
    category: charge?.category ?? null,
  };
});

const missing = districtsWithCharge.filter((d) => d.charge === null);

const payload = {
  extractedAt: new Date().toISOString(),
  source: "admin-fe/src/utils/contents.tsx",
  zones: categories.map((cat) => ({
    name: cat,
    charge: chargeByCategory[cat] ? [...chargeByCategory[cat]][0] : null,
  })),
  divisions: divisions.map((dv) => ({
    sourceId: dv.id,
    name: dv.name,
    bnName: dv.bn_name || "",
  })),
  districts: districtsWithCharge,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(payload, null, 2));

console.log(`divisions:  ${divisions.length}`);
console.log(`districts:  ${districts.length} (${missing.length} without charge)`);
console.log(`categories: ${categories.join(", ")}`);
if (missing.length)
  console.log(
    "missing-charge names:",
    missing.slice(0, 20).map((d) => `${d.name} (${d.division})`).join(", "),
  );
console.log(`written: ${outPath}`);
