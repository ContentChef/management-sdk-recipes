# `ts-config`

Shared package for the configuration of typescript for all the packages in the repo

## Usage

Add the package as dependency in target package.

```JSON
{
  "devDependencies": {
    "ts-config": "^1.0.0"
  }
}
```

Add the file `tsconfig.json` in the root of the new package

```JSON
{
  "extends": "ts-config/tsconfig.json",
  "include": ["./**/*.ts"],
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "exclude": [
    "dist"
  ]
}
```

const tsConfig = require('ts-config');

// TODO: DEMONSTRATE API
```
