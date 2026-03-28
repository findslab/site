import {useCallback, useRef} from "react";

export const useThrottleFn = (callback: () => void, delay = 500) => {
  const timer: { current: number | null } = useRef(null);

  return useCallback(() => {
    if (timer.current === null) {
      callback();

      timer.current = window.setTimeout(() => {
        timer.current = null;
      }, delay);
    }
  }, [callback]);
};
