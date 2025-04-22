# Figma Variables to W3C Tokens

This application transforms Figma variables to W3C compliant design tokens.

It takes three arguments:

1. Input file path (DesignTokensFile)
2. Output file path (DesignTokensFile)
3. Rules file path (DesignTokenGroupRule[])

## Prerequisites for development

1. Install [Node Version Manager](https://github.com/nvm-sh/nvm) (nvm). It
   allows using different versions of node via the command line
2. Run `nvm use` to use the required version of node.
3. Run `pnpm i` to install required packages.

## Development Build

```shell
pnpm dev
```

Application will rerun if you make code changes.

## Production Build

```shell
pnpm build

# Start using pnpm script
pnpm start

# Or start directly using node
node dist

# Or start using npx (this requires publishing the package to npm)
npx figvar-to-w3c
```

## All Commands

```
pnpm build            # builds the prod bundle
pnpm clean            # deletes all build artifacts
pnpm dev              # runs the dev build
pnpm fix              # lints, formats and attempts to fix any issues (requires `pnpm build` has been ran)
pnpm lint             # runs the linter, useful for debugging lint issues (generally `pnpm fix` is preferred)
pnpm start            # runs the prod build
```
