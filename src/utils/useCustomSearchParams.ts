import {useSearchParams} from "react-router-dom";
import {useCallback} from "react";

export const useCustomSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const get = useCallback(() => {
    const params = searchParams;
    let result: Record<string, string> = {};
    if (params.size === 0) return {}
    params.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  }, [searchParams]);

  const set = useCallback((name: string, value: string) => {
    setSearchParams((prev) => {
      prev.set(name, value);
      return prev;
    });
  }, [searchParams]);

  return {get, set};
}
