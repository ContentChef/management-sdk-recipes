# `content-migration`

> This example gives you a lightweight framework to apply migration to contents. 
> You can provide a content definition mnemonic and the migration will have a change to run against all not archived contents in the configured space

## Usage

Rename the file `sample.env` to `.env` and set the environment variables to the correct values.

### CONTENTCHEF_SPACE_ID

This is the space id where you want to read contents

### CONTENTCHEF_ACCESS_TOKEN

This is your generated *PERSONAL* access token, you can create one in the `Programmatic access` section of the dashboard.
The token can be used for any kind of automation, it's binded to the user to when provided the script can access all the spaces currently available to the bound user.

### CONTENTCHEF_SEARCH_DEFINITION_MNEMONIC

Use the variable to choose the target definition, this is only for the example, you can modify the code for customize the filters as you need

### MIGRATION_DRY_RUN

If set to `true` the content update will be skipped, whatever value of `persistChanges` return the execution of the migrate function

## SCRIPTS

You will need to bootstrap `lerna` first

```bash
npx lerna bootstrap
```

Once you are ready to run migration run the 

```bash
npx lerna run run-migration
```
