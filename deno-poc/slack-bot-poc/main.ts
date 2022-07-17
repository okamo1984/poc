import { Hono, logger, serve } from "./deps.ts";
import { BotMessage, ChangedMessage, Message } from "./type.d.ts";
import { postMessage } from "./utils.ts";

const app = new Hono();

app.use("*", logger());
app.post("/slack/event", async (c) => {
  const body = await c.req.json();
  console.log("request is incoming", body);
  if (body.type === "url_verification") {
    return c.json({ challenge: body.challenge });
  }
  if (body.type !== "event_callback") {
    return c.text("Bad request");
  }
  const message: Message = body.event;
  if (message.type !== "message") {
    return c.text("Bad request");
  }
  if ((message as BotMessage).bot_id) {
    return c.text("Ignore bot's message");
  }
  if ((message as ChangedMessage).subtype === "message_changed") {
    await postMessage({
      channel: message.channel,
      text: "message is changed",
    });
    return c.text("OK");
  }

  await postMessage({
    channel: message.channel,
    text: "nice message",
    thread_ts: message.ts,
  });
  return c.text("OK");
});

app.onError((err, c) => {
  console.error(err);
  return c.text("Error");
});

serve(app.fetch);
