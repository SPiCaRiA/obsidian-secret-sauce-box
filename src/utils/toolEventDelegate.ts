import type {EventRef, Events as ObRegisteredEl} from 'obsidian';

type EventType = keyof HTMLElementEventMap;
type UniqueEvtID = symbol;

type DOMListener<T extends EventType> = (
  this: HTMLElement,
  ev: HTMLElementEventMap[T],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (...args: any[]) => any;

export class ToolEventDelegate {
  private domEventMap: Map<
    UniqueEvtID,
    {
      el: HTMLElement;
      type: EventType;
      listener: DOMListener<EventType>;
      options?: boolean | AddEventListenerOptions;
    }
  > = new Map();
  private obEventMap: Map<
    UniqueEvtID,
    {
      obEl: ObRegisteredEl;
      evtRef: EventRef;
    }
  > = new Map();

  // --- DOM Events ---
  public registerDOMEvent<K extends EventType>(
    el: HTMLElement,
    type: K,
    listener: DOMListener<K>,
    options?: boolean | AddEventListenerOptions,
  ): UniqueEvtID {
    const uniqueEvtID = Symbol('event-id');

    this.domEventMap.set(uniqueEvtID, {el, type, listener, options});
    el.addEventListener(type, listener, options);

    return uniqueEvtID;
  }

  public removeDOMEventByID(uniqueEvtID: UniqueEvtID): boolean {
    return this.domEventMap.delete(uniqueEvtID);
  }

  public removeAllDOMEvents() {
    this.domEventMap.forEach(({el, type, listener, options}) => {
      el.removeEventListener(type, listener, options);
    });
    this.domEventMap.clear();
  }

  // --- Obsidian Events ---
  public registerObEvent(
    win: ObRegisteredEl,
    type: string,
    listener: Listener,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx?: any,
  ): UniqueEvtID {
    const uniqueEvtID = Symbol('event-id');

    const evtRef = win.on(type, listener, ctx);
    this.obEventMap.set(uniqueEvtID, {obEl: win, evtRef});

    return uniqueEvtID;
  }

  public removeObEventByID(uniqueEvtID: UniqueEvtID): boolean {
    return this.obEventMap.delete(uniqueEvtID);
  }

  public removeAllObEvents() {
    this.obEventMap.forEach(({obEl, evtRef}) => obEl.offref(evtRef));
    this.obEventMap.clear();
  }

  // --- General ---
  public removeAll() {
    this.removeAllDOMEvents();
    this.removeAllObEvents();
  }
}
