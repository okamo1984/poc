import { crypto } from "./deps.ts";
import { PostMessage, ReplyPostMessage } from "./type.d.ts";

export const SLACK_TOKEN = Deno.env.get("SLACK_TOKEN") || "";
const SLACK_SIGNING_SECRET = Deno.env.get("SLACK_SIGNING_SECRET") || "";

// https://api.slack.com/authentication/verifying-requests-from-slack
export async function verifyRequest(
  timestamp: number,
  body: string,
  signatureFromSlack: string,
): Promise<boolean> {
  const sig_basestring = ["v0", timestamp, body].join(":");
  // https://medium.com/deno-the-complete-reference/sign-verify-jwt-hmac-sha256-4aa72b27042a
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SLACK_SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "SHA-256",
    key,
    new TextEncoder().encode(sig_basestring),
  );
  return new TextDecoder().decode(digest) === signatureFromSlack;
}

export async function postMessage(message: PostMessage | ReplyPostMessage) {
  const endpoint = "https://slack.com/api/chat.postMessage";

  const postRes = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SLACK_TOKEN}`,
    },
    body: JSON.stringify(message),
  });

  const resJson = await postRes.json();
  if (!resJson.ok) {
    throw new Error(`fetch error: ${resJson.error}`);
  }
}
