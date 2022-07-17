import { SELF } from "$fresh/src/runtime/csp.ts";

export const HOME_URL = Deno.env.get("HOME_URL") ?? "http://localhost:8000";
export const CSP_DEFAULT_SRC = [SELF, "https://lh3.googleusercontent.com"];
