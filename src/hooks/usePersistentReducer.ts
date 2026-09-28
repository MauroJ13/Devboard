import { useEffect, useReducer, type Dispatch } from "react";

/**
 * useReducer + automatische Synchronisierung mit einer Persistenzschicht
 * (hier: localStorage). Der Initialzustand wird lazy geladen.
 */
export function usePersistentReducer<S, A>(
  reducer: (state: S, action: A) => S,
  load: () => S,
  save: (state: S) => void,
): [S, Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    save(state);
  }, [state, save]);

  return [state, dispatch];
}
