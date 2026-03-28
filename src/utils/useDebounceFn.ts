import {useCallback, useRef} from "react";

export const useDebounceFn = (callback: () => void, delay = 500) => {
  const timer: { current: number | null } = useRef(null);

  return useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      callback();
    }, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    }
  }, [callback]);
};
