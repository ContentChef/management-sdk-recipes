import { createChefSpaceClient, ContentChefClient } from '@contentchef/contentchef-management-js-client';

export const client: ContentChefClient = createChefSpaceClient(
                          process.env.CONTENTCHEF_ACCESS_TOKEN as string, 
                          process.env.CONTENTCHEF_SPACE_ID as string);

