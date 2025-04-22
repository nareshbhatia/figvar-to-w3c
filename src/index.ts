import { transformDesignTokenFile } from './transform';
import type { DesignTokensFile, DesignTokenGroupRule } from './types';
import { readFileSync, writeFileSync } from 'fs';

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.error(
    'Usage: npx figvar-to-w3c <input-file> <output-file> <rules-file>',
  );
  process.exit(1);
}

const [inputPath, outputPath, rulesPath] = args;

try {
  // Read the input file
  const inputFile = JSON.parse(
    readFileSync(inputPath, 'utf-8'),
  ) as DesignTokensFile;

  // Read the rules file
  const rules = JSON.parse(
    readFileSync(rulesPath, 'utf-8'),
  ) as DesignTokenGroupRule[];

  // Transform the inputFile using the rules
  const transformedFile = transformDesignTokenFile(inputFile, rules);

  // Write the output file
  // eslint-disable-next-line no-restricted-syntax
  writeFileSync(outputPath, `${JSON.stringify(transformedFile, null, 2)}\n`);

  console.log('Transformation completed successfully!');
} catch (error) {
  console.error('Error during transformation:', error);
  process.exit(1);
}
