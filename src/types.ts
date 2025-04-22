// ---------- Design Tokens ----------

// A single token
export interface DesignToken {
  /* type of the token */
  $type: string;

  /* string value can be either a real value or a reference to another token in the format {color.primary} */
  $value: boolean | number | string;
}

// Group of tokens
export interface DesignTokenGroup {
  [key: string]: DesignToken | DesignTokenGroup; // Tokens can be nested
}

// A design tokens file contains groups keyed by name
export interface DesignTokensFile {
  [key: string]: DesignTokenGroup; // Tokens can be nested
}

// ---------- Design Token Transformers ----------

export enum DesignTokenValueConverter {
  pxToRem = 'pxToRem',
  remToPx = 'remToPx',
}

export interface DesignTokenTypeRule {
  outputType: string;
}

export interface DesignTokenNumberValueRule {
  valueRuleType: 'DesignTokenNumberValueRule';
  applyToValues?: number[];
  valueConverter?: DesignTokenValueConverter;
  appendUnit?: string;
}

export type DesignTokenValueRule = DesignTokenNumberValueRule;

export interface DesignTokenGroupRule {
  applyToGroup: string;
  typeRule?: DesignTokenTypeRule;
  valueRules?: DesignTokenValueRule[];
}
