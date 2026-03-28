export const setCookie = ({name, value, days}: { name: string, value: string, days: number }) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

export const cookie = ({key}: { key: string }) => {
  const cookies = {} as any;
  const documentCookies = document.cookie ? document.cookie.split('; ') : [];

  for (let i = 0, len = documentCookies.length; i < len; i++) {
    const cookieParts = documentCookies[i].split('=');

    const _cookie = cookieParts.slice(1).join('=');
    const name = cookieParts[0];

    cookies[name] = _cookie;
  }

  const value = cookies[key];
  if (value === undefined) return undefined;
  return value;
}
