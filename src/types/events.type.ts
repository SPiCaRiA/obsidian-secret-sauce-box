import type {EventRef, Events as ObRegisteredEl} from 'obsidian';

export {ObRegisteredEl};

export type EventType = keyof HTMLElementEventMap;
export type UniqueEvtID = symbol;

export type DOMListener<T extends EventType> = (
  this: HTMLElement,
  ev: HTMLElementEventMap[T],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObListener = (...data: any[]) => any;

// --- Event Record Map ---
export type DOMEventRecordMap = Map<
  UniqueEvtID,
  Readonly<{
    el: HTMLElement;
    type: EventType;
    listener: DOMListener<EventType>;
    options?: boolean | AddEventListenerOptions;
  }>
>;

export type ObEventRecordMap = Map<
  UniqueEvtID,
  Readonly<{
    obEl: ObRegisteredEl;
    evtRef: EventRef;
  }>
>;
