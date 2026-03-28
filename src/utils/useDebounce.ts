import {useEffect, useRef, useState} from "react";

export const useDebounce = <T>(value: T, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timer: { current: number | null } = useRef(null);

  useEffect(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);


    return () => {
      if (timer.current) clearTimeout(timer.current);
    }
  }, [value, delay]);

  return debouncedValue;
};



