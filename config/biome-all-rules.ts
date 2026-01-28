// biome-ignore lint/correctness/noNodejsModules: CLI
import fs from 'node:fs/promises';

/*
 * This script does the following:
 * - Fetches the latest biome schema from `https://biomejs.dev/schemas/latest/schema.json`
 * - Based on that schema, generates a Biome `linter.rules` object where all the rules are set to `"on"` (`allRules`)
 *
 *
 * Workaround for https://github.com/biomejs/biome/issues/5764
 * via https://github.com/adamhl8 in https://github.com/biomejs/biome/issues/5764#issuecomment-3286711578
 */

const BIOME_CONFIG_PATH = './config/biome-all-rules.json';
const DEFAULT_RULE_SEVERITY = 'on';

async function getAllRules() {
  const response = await fetch(
    'https://biomejs.dev/schemas/latest/schema.json',
  );
  const schema = (await response.json()) as BiomeSchema;
  const ruleGroupName = Object.keys(schema.$defs.Rules.properties).filter(
    (key) => key !== 'recommended',
  );

  const allRules: AllRules = {};
  for (const groupName of ruleGroupName) {
    // definition names are in PascalCase
    const groupDefinitionName =
      groupName.charAt(0).toUpperCase() + groupName.slice(1);
    const groupDefinition = schema.$defs[groupDefinitionName];
    const ruleNames = Object.keys(groupDefinition?.properties ?? {}).filter(
      (key) => key !== 'recommended',
    );

    allRules[groupName] = {};
    for (const ruleName of ruleNames) {
      allRules[groupName][ruleName] = DEFAULT_RULE_SEVERITY;
    }
  }

  return allRules;
}

const allRules = await getAllRules();
const biomeConfig = {
  $schema: 'https://biomejs.dev/schemas/latest/schema.json',
  linter: {
    rules: allRules,
  },
} as BiomeConfig;

await fs.writeFile(BIOME_CONFIG_PATH, JSON.stringify(biomeConfig, null, 2));

// ==== types ====

type BiomeSchema = {
  $defs: {
    // biome-ignore lint/style/useNamingConvention: from api
    Rules: {
      properties: Record<string, unknown>;
    };
    [definitionName: string]: {
      properties: Record<string, unknown>;
    };
  };
};

type AllRules = {
  [groupName: string]: {
    [ruleName: string]: string;
  };
};

type BiomeConfig = {
  linter: {
    rules: Record<string, unknown>;
  };
};
