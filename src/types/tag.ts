export type TagType = 'CATEGORY' | 'CUSTOM';

export type MemberTag = {
  memberUuid: string;
  tagName: string;
  tagType: TagType;
};

export type MemberTagsResponse = {
  customTags: MemberTag[];
  categoryTags: MemberTag[];
};

export type TagAutocompleteResult = {
  name: string;
  usageCount: number;
};

export type TagAutocompleteParams = {
  prefix: string;
  tagType?: TagType;
  limit?: number;
};

export type UpdateTagsRequest = {
  names: string[];
  tagType: TagType;
};