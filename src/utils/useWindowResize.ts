import {useEffect, useState} from "react";
import {useDebounceFn} from "./useDebounceFn";

export const useWindowResize = () => {
  const [windowSize, setWindowSize] = useState<{ width: number | undefined; height: number | undefined }>({
    width: undefined,
    height: undefined,
  });

  const handleResize = useDebounceFn(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, 50);

  useEffect(() => {
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return {
    isMobile: (windowSize.width !== undefined && windowSize.width <= 768),
    isTablet: (windowSize.width !== undefined && windowSize.width <= 1024),
    width: windowSize.width,
    height: windowSize.height
  };
};
