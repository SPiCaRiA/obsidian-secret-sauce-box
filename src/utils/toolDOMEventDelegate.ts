type EventType = keyof HTMLElementEventMap;

type Listener<T extends EventType> = (
  this: HTMLElement,
  ev: HTMLElementEventMap[T],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any;

type UniqueEvtID = symbol;

export class ToolDOMEventDelegate {
  private eventMap: Map<
    UniqueEvtID,
    {
      el: HTMLElement;
      type: EventType;
      listener: Listener<EventType>;
      options?: boolean | AddEventListenerOptions;
    }
  > = new Map();

  public registerDOMEvent<K extends EventType>(
    el: HTMLElement,
    type: K,
    listener: Listener<K>,
    options?: boolean | AddEventListenerOptions,
  ): UniqueEvtID {
    const uniqueEvtID = Symbol('event-id');

    this.eventMap.set(uniqueEvtID, {el, type, listener, options});
    el.addEventListener(type, listener, options);

    return uniqueEvtID;
  }

  public removeDOMEventByID(uniqueEvtID: UniqueEvtID): boolean {
    return this.eventMap.delete(uniqueEvtID);
  }

  public removeAllDOMEvents() {
    this.eventMap.forEach(({el, type, listener, options}) => {
      el.removeEventListener(type, listener, options);
    });
    this.eventMap.clear();
  }
}
