import { AUTH_URLS } from "@/utils/constants";

export const getAppsAuthUrl = (redirectUrl: string, toAppStr: string) => {
  const appPath = toAppStr.replace(/^apps\//, '');

  return `${process.env.NEXT_PUBLIC_APPS_HOST}/api/auth/${appPath}`
}

export const isAppLogin = (to: string) => {
  return to.startsWith("apps/");
}

export const getLoginRedirectUrl = (query: Record<string, string>, t?: string) => {
	let { to, redirectUrl } = query;

  to = decodeURIComponent(to);

  if (!to || to === "mtbird") {
    return redirectUrl ? decodeURIComponent(redirectUrl) : "/";
  }

  const append =
    redirectUrl &&
    (redirectUrl.startsWith("http://") || redirectUrl?.startsWith("https://"));

  // const authUrl = AUTH_URLS[to];

  const authUrl = to.startsWith("apps/") ? getAppsAuthUrl(redirectUrl, to) : AUTH_URLS[to];

  console.log("ttt to:", to, authUrl, AUTH_URLS);

  let targetUrl = authUrl || redirectUrl;
  if (targetUrl?.indexOf("?") === -1) {
    targetUrl += "?";
  }

  const restQuery = getRestQuery(query);

  return (
    `${targetUrl}&t=${t}` +
    (append ? `&redirectUrl=${encodeURIComponent(redirectUrl)}` : "") +
    (restQuery ? `&${restQuery}` : "")
  );
};

const getRestQuery = (query: Record<string, any>) => {
  const search = new URLSearchParams(query);
  search.delete("redirectUrl");
  search.delete("to");

  return search.toString();
};
