import {readFileSync, writeFileSync} from "node:fs";

interface PackageJson {
  version: string;
}

function updateVersion(workspace: string) {
  const pkg = JSON.parse(readFileSync(new URL(`../${workspace}/package.json`, import.meta.url), "utf8")) as PackageJson;

  writeFileSync(
    new URL(`../${workspace}/src/version.ts`, import.meta.url),
    `export const version = '${pkg.version}';\n`,
    "utf8"
  );
}

updateVersion('retroload');
updateVersion('retroload-lib');
