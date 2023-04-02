import type {WorkspaceLeaf} from 'obsidian';

export type WorkspaceLeafExt = {
  containerEl: HTMLElement;
  tabHeaderEl: HTMLElement;
  parent: WorkspaceLeafExt;
  children: WorkspaceLeafExt[];
} & WorkspaceLeaf;

export type MarkedHTMLElement<T> = HTMLElement & {
  [label in symbol]: T;
};
