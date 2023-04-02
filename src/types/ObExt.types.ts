import type {WorkspaceLeaf, Workspace} from 'obsidian';

export type MarkedHTMLElement<T> = HTMLElement & {
  [label in symbol]: T;
};

export type WorkspaceLeafExt = {
  containerEl: HTMLElement;
  tabHeaderEl: HTMLElement;
  parent: WorkspaceLeafExt;
  children: WorkspaceLeafExt[];
} & WorkspaceLeaf;

export type WorkspaceExt = Workspace & {
  activeTabGroup: WorkspaceLeafExt;
};

export type WorkspaceTabGroupExt = WorkspaceLeafExt & {
  selectTab: (tab: WorkspaceLeaf) => void;
  selectTabIndex: (tabIndex: number) => void;
};
