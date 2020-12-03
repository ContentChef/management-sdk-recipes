'use strict';

const pLimit = require('p-limit');
import { ListContentsFilters } from '@contentchef/contentchef-management-js-client/dist/types/Content';
import { client } from './client-setup';

const MAX_CONCURRENCY = 2;

const MIGRATION_DRY_RUN = !!process.env.MIGRATION_DRY_RUN

export async function listContentIdsMatchingFilter(filters: ListContentsFilters, take = 40) {
    
    const fetchContentIds = async (skip: number): Promise<number[]> => {
        
        const result = await client.contents.list({take, skip, filters});
        
        const ids = result.items.map(item => item.id);

        const shouldContinueReading = result.total - (skip + result.items.length) > 0;

        return ids.concat(shouldContinueReading ? await fetchContentIds(skip + take) : []);        
    }

    return await fetchContentIds(0);
}

export type ContentInfo = {
    name: string,
    publicId: string,
    channelIds: number[],
    repositoryId: number,
    payload: object,
    tags: string[]
    onlineDate: Date | undefined,
    offlineDate: Date | undefined
}

export type MigrationFunctionResult = {
    contentData: ContentInfo | undefined,
    persistChanges: boolean
}

export type MigrationStrategyFunction = (contentId: number, definitionId: number, version: number, contentData: ContentInfo) => Promise<MigrationFunctionResult>;

const logOnlyMigrationFunction: MigrationStrategyFunction = async (contentId: number, definitionId: number, version: number, contentData: ContentInfo) => {
    console.log(`This is log only for content ${contentId} version ${version} that use definition ${definitionId}`);
    return { contentData: contentData, persistChanges: false };
}

export const migrateContents = async (contentIds: number[], migrationStrategy: MigrationStrategyFunction = logOnlyMigrationFunction) => {
    if (MIGRATION_DRY_RUN) {
        console.log('Migration dry run enabled, all updated will be skipped see MIGRATION_DRY_RUN in README')
    }

    const lookupContent = async (contentId: number) => {
        const response = await client.contents.get({ id: contentId, retrieveLinkingContents: false });

        const content = response.content!;

        const definitionId = content.definition.id;        
        const repositoryId = content.repository.id;

        const channelIds = content.channels.map(item => item.id);

        const { id, name, payload, tags, publicId, onlineDate, offlineDate, version } = content;

        return {
            id,
            definitionId,
            version,
            contentData: {
                channelIds,
                definitionId,            
                repositoryId,            
                payload,
                tags,
                name,
                offlineDate,
                onlineDate,
                publicId
            }            
        };
    }
    const patchContent = async (contentId: number) => {
        try {
            const { id, definitionId, version, contentData} = await lookupContent(contentId);
    
            const { contentData: modifiedContentData, persistChanges } = await migrationStrategy(id, definitionId, version, contentData);
            
            if (!!persistChanges || MIGRATION_DRY_RUN) {               
                return { id: contentId, publicId: contentData.publicId, success: true, skipped: true, currentVersion: version };    
            }

            const request = { ... modifiedContentData!, id, definitionId};
    
            const patchResult = await client.contents.update(request)
    
            return { id: contentId, publicId: patchResult.publicId, success: true, previousVersion: version, newVersion: patchResult.version };
        } catch (err) {
            const { type, requestId, details: errorDetails } = err;
            return { id: contentId, success: false, errorType: type, requestId, errorDetails, rawError: err };
        }
    }
    
    const limit = pLimit(MAX_CONCURRENCY);
 
    const input = contentIds.map(contentId => limit(() => patchContent(contentId)));
    
    const result = await Promise.all(input);
    
    return result;
}
