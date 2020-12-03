
require('dotenv').config()

const { ContentsStatus } = require('@contentchef/contentchef-management-js-client/dist/types/Content');

import { listContentIdsMatchingFilter, migrateContents } from './migration-framework';

const searchAndPatchContents = async () => {
  const contentFilters = { contentsStatus: ContentsStatus.unarchived, definitionMnemonicIds: [process.env.CONTENTCHEF_SEARCH_DEFINITION_MNEMONIC as string] };

  const ids = await listContentIdsMatchingFilter(contentFilters)

  if (ids.length === 0) {
    console.log('Nothing to patch');
    return;
  }

  const patchResult = await migrateContents(ids, async (contentId, definitionId, version, contentData) => {
    console.log(`Migrating content with id ${contentId} of definition ${definitionId}, version ${version}`)
    // Implement here your migration logic, 
    // use persistChanges:false if you want to skip the current content migration eg. it is not needed
    return { contentData, persistChanges: false }
  });

  return patchResult;
}

searchAndPatchContents().then( result => {
  console.log(JSON.stringify(result, null, 1));
}).catch(error => {
  console.error(JSON.stringify(error));
});

