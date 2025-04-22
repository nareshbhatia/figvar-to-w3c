import { DesignTokenValueConverter } from './types';
import type {
  DesignTokensFile,
  DesignTokenGroupRule,
  DesignToken,
  DesignTokenRule,
  DesignTokenGroup,
} from './types';

// Helper function to check if a value is a token reference
function isAliasToken(token: DesignToken): boolean {
  const { $value } = token;
  return (
    typeof $value === 'string' && $value.startsWith('{') && $value.endsWith('}')
  );
}

// Helper function to check if a value is a DesignToken
function isDesignToken(value: object): boolean {
  return '$type' in value && '$value' in value;
}

// Function to transform a single token based on rules
function transformToken(
  token: DesignToken,
  rules: DesignTokenRule[],
): DesignToken {
  let transformedToken = { ...token };

  // Apply all rules that match
  for (const tokenRule of rules) {
    if (tokenRule.ruleType === 'DesignTokenTypeRule') {
      transformedToken = {
        ...transformedToken,
        $type: tokenRule.outputType,
      };
    }

    if (
      tokenRule.ruleType === 'DesignTokenNumberValueRule' &&
      !isAliasToken(token) &&
      typeof transformedToken.$value === 'number' &&
      (tokenRule.applyToValues === undefined ||
        tokenRule.applyToValues.includes(transformedToken.$value))
    ) {
      let value = transformedToken.$value;
      if (tokenRule.valueConverter !== undefined) {
        switch (tokenRule.valueConverter) {
          case DesignTokenValueConverter.pxToRem:
            value /= 16;
            break;
          case DesignTokenValueConverter.remToPx:
            value *= 16;
            break;
        }
      }

      if (tokenRule.appendUnit !== undefined) {
        // Convert the value to a string with the unit
        const valueWithUnit = `${value}${tokenRule.appendUnit}`;
        transformedToken = {
          ...transformedToken,
          $value: valueWithUnit,
        };
      } else {
        transformedToken = {
          ...transformedToken,
          $value: value,
        };
      }
    }
  }

  return transformedToken;
}

function transformGroup(
  group: DesignTokenGroup,
  groupName: string,
  tokenRules: DesignTokenRule[],
) {
  const result: DesignTokenGroup = {};

  for (const [key, value] of Object.entries(group)) {
    if (isDesignToken(value)) {
      result[key] = transformToken(value as DesignToken, tokenRules);
    } else {
      result[key] = transformGroup(
        value as DesignTokenGroup,
        `${groupName}.${key}`,
        tokenRules,
      );
    }
  }

  return result;
}

// Function to transform a group of tokens
export function transformDesignTokenFile(
  inputFile: DesignTokensFile,
  rules: DesignTokenGroupRule[],
): DesignTokensFile {
  const result: DesignTokensFile = {};

  // Iterate through each group in the input file
  for (const [groupName, group] of Object.entries(inputFile)) {
    // Find a matching rule for this group
    const matchingRule = rules.find((rule) => rule.applyToGroup === groupName);

    if (matchingRule) {
      result[groupName] = transformGroup(
        group,
        groupName,
        matchingRule.tokenRules,
      );
    } else {
      result[groupName] = group;
    }
  }

  return result;
}
