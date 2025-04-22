import { DesignTokenValueConverter } from './types';
import type {
  DesignTokensFile,
  DesignTokenGroupRule,
  DesignToken,
  DesignTokenGroup,
  DesignTokenNumberValueRule,
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

function applyNumberValueRule(value: number, rule: DesignTokenNumberValueRule) {
  let transformedValue: number | string = value;

  if (rule.valueConverter !== undefined) {
    switch (rule.valueConverter) {
      case DesignTokenValueConverter.pxToRem:
        transformedValue /= 16;
        break;
      case DesignTokenValueConverter.remToPx:
        transformedValue *= 16;
        break;
    }
  }

  if (rule.appendUnit !== undefined) {
    transformedValue = `${transformedValue}${rule.appendUnit}`;
  }

  return transformedValue;
}

// Function to transform a single token based on rules
function transformToken(
  token: DesignToken,
  groupRule: DesignTokenGroupRule,
): DesignToken {
  let transformedToken = { ...token };
  const { typeRule, valueRules } = groupRule;

  // Apply the type rule if specified
  if (typeRule !== undefined) {
    transformedToken = {
      ...transformedToken,
      $type: typeRule.outputType,
    };
  }

  // Apply value conversion only if this is not an alias token
  if (!isAliasToken(transformedToken) && valueRules !== undefined) {
    // Apply the first matching rule
    for (const valueRule of valueRules) {
      if (
        valueRule.valueRuleType === 'DesignTokenNumberValueRule' &&
        typeof transformedToken.$value === 'number' &&
        (valueRule.applyToValues === undefined ||
          valueRule.applyToValues.includes(transformedToken.$value))
      ) {
        const transformedValue = applyNumberValueRule(
          transformedToken.$value,
          valueRule,
        );
        transformedToken = {
          ...transformedToken,
          $value: transformedValue,
        };
        // break out of the loop if a rule is applied
        break;
      }
    }
  }

  return transformedToken;
}

function transformGroup(
  group: DesignTokenGroup,
  groupName: string,
  groupRule: DesignTokenGroupRule,
) {
  const result: DesignTokenGroup = {};

  for (const [key, value] of Object.entries(group)) {
    if (isDesignToken(value)) {
      result[key] = transformToken(value as DesignToken, groupRule);
    } else {
      result[key] = transformGroup(
        value as DesignTokenGroup,
        `${groupName}.${key}`,
        groupRule,
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
    const matchingGroupRule = rules.find(
      (rule) => rule.applyToGroup === groupName,
    );

    if (matchingGroupRule) {
      result[groupName] = transformGroup(group, groupName, matchingGroupRule);
    } else {
      result[groupName] = group;
    }
  }

  return result;
}
