import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

// The public price list is shared by the configurator, finder and calculator,
// so it is fetched once per page load. There is deliberately no built-in
// fallback price list: on failure the caller shows an error, never old numbers.
let publicPromise = null;

export function usePricing(source = 'public') {
  const [state, setState] = useState({ pricing: null, error: null, loading: true });

  const load = useCallback(() => {
    setState({ pricing: null, error: null, loading: true });
    let promise;
    if (source === 'sales') {
      promise = api.salesPricing();
    } else {
      publicPromise ??= api.nasPricing().catch((err) => { publicPromise = null; throw err; });
      promise = publicPromise;
    }
    let alive = true;
    promise
      .then((pricing) => alive && setState({ pricing, error: null, loading: false }))
      .catch((error) => alive && setState({ pricing: null, error, loading: false }));
    return () => { alive = false; };
  }, [source]);

  useEffect(() => load(), [load]);
  return { ...state, reload: load };
}
