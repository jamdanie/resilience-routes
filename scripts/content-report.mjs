import { discoverContentPacks, projectPath } from "./content-packs.mjs";

const packs = await discoverContentPacks();
const rows = packs.map((pack) => ({
  id: pack.directoryId,
  name: pack.manifest.name,
  version: pack.manifest.version,
  status: pack.manifest.status,
  scenarios: pack.scenarios.length,
  assets: Array.isArray(pack.mission.assets) ? pack.mission.assets.length : 0,
  path: projectPath(pack.directory),
}));

const markdown = process.argv.includes("--markdown");

if (markdown) {
  console.log("## Resilience Routes content report\n");
  console.log("| Mission pack | Version | Status | Injects | Assets | Folder |");
  console.log("| --- | --- | --- | ---: | ---: | --- |");
  rows.forEach((row) => {
    console.log(`| ${row.name} | ${row.version} | ${row.status} | ${row.scenarios} | ${row.assets} | \`${row.path}\` |`);
  });
  console.log(`\n**Total:** ${rows.length} mission pack${rows.length === 1 ? "" : "s"}, ${rows.reduce((sum, row) => sum + row.scenarios, 0)} injects.`);
} else {
  console.table(rows.map(({ path, ...row }) => row));
  console.log(`Content folders: ${rows.map(({ path }) => path).join(", ")}`);
}
