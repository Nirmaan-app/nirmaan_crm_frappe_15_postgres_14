// src/types/Search.ts

export type SearchResultItem = {
  name: string;
  title: string;
  doctype: string;
  path: string;
};

export type SearchResults = {
  "CRM Company"?: SearchResultItem[];
  "CRM Contacts"?: SearchResultItem[];
  "CRM BOQ"?: SearchResultItem[];
  "CRM Task"?: SearchResultItem[];
  "CRM Users"?: SearchResultItem[];
};

export type SearchDocTypeKey = keyof SearchResults;