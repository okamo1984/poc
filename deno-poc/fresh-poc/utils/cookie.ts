import type { Cookie } from "http";
import { deleteCookie, getCookies, setCookie } from "http";
import type { LoginUser } from "../models/user.ts";

const loginCookieName = "fresh_poc_login";

export const setLoginCookie = (headers: Headers, loginUser: LoginUser) => {
  const cookie: Cookie = {
    name: loginCookieName,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 60,
    secure: false,
    value: btoa(JSON.stringify(loginUser)),
    path: "/",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
  setCookie(headers, cookie);
};

export const deleteLoginCookie = (headers: Headers) => {
  deleteCookie(headers, loginCookieName);
};

export const getLoginCookie = (headers: Headers): string => {
  const cookies = getCookies(headers);
  return cookies[loginCookieName];
};
