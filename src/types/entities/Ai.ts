export interface IAssistant {
  id: string;
  name: string;
  avatar: string;
  desc?: string;
  defaultMessage?: string;
  textAvatar?: string;

  createUserId: string;
  convNum: number;
  model: string;
  fineTuneId: null;
  topP: null;
  temperature: null;
  systemMessage: null;
  demoUser: null;
  demoAssistant: null;
  userProfix: null;
  corpusId: number;
  isPublic: false;
  isDelete: false;
  pdfUrl: null;
  categoryId: null;
  topicId: null;
  assistantTopicId: null;
}

export interface IMessage {
  from: "them" | "me" | string;
  content: string;
  messageId: string;
  conversationId: string;
  nickName?: string;
  type: "text" | string;
  avatar?: string;
  parentMessageId?: string;
}
export interface IConversation {
  id: string;
  messages: IMessage[];
}
