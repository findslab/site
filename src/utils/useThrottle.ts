import {useEffect, useRef, useState} from "react";

export const useThrottle = <T>(callback: T, delay = 500) => {
  const [value, setValue] = useState<T>(callback);
  const timer: { current: number | null } = useRef(null);

  useEffect(() => {
    if (timer.current === null) {
      setValue(value);
      timer.current = window.setTimeout(() => {
        timer.current = null;
      }, delay);
    }

    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, [callback]);

  return value;
};
