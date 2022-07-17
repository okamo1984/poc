export type Message = {
  type: "message";
  channel: string;
  user: string;
  text: string;
  ts: number;
  client_msg_id: string;
};

export type BotMessage = Message & {
  bot_id: string;
};

type EditedMetadata = {
  user: string;
  ts: number;
};

type EditedMessage = Message & {
  edited: EditedMetadata;
};

export type ChangedMessage = Partial<Message> & {
  subtype: "message_changed";
  hidden: boolean;
  message: EditedMessage;
};

export type PostMessage = {
  channel: string;
  text: string;
};

export type ReplyPostMessage = PostMessage & {
  thread_ts: number;
};
