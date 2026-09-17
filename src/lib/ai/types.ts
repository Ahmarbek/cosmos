import type { Lang } from '../../i18n/lang';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  character: string;
  message: string;
  history: ChatMessage[];
  /** the language the site is being read in, which the answer follows */
  lang: Lang;
}

export interface ChatResponse {
  response: string;
  character: {
    id: string;
    name: string;
    label: string;
  };
  /** where the answer came from, surfaced in the UI so nothing is passed off */
  source: 'mock' | 'model';
  model?: string;
}

export interface ChatProvider {
  id: string;
  send(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse>;
}
