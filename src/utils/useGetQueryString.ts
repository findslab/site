import qs from "qs";
import {useLocation} from "react-router-dom";

export const useGetQueryString = () => {
  const location = useLocation();

  const rawQueryString = decodeURI(location.search);
  const parsedQueryString = qs.parse(rawQueryString, {
    ignoreQueryPrefix: true,
  });

  Object.keys(parsedQueryString).forEach((key) => {
    if (parsedQueryString[key] === "true") {
      parsedQueryString[key] = 'true';
    } else if (parsedQueryString[key] === "false") {
      parsedQueryString[key] = 'false';
    }
  });

  return parsedQueryString;
}
