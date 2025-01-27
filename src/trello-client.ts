import axios from 'axios';
import { Board, List, Card, CardDetails } from './types.js';

export class TrelloClient {
  private baseUrl = 'https://api.trello.com/1';
  private auth: { key: string; token: string };

  constructor(key: string, token: string) {
    this.auth = { key, token };
  }

  private getAuthParams(): string {
    return `key=${this.auth.key}&token=${this.auth.token}`;
  }

  async getBoards(): Promise<Board[]> {
    const response = await axios.get(
      `${this.baseUrl}/members/me/boards?${this.getAuthParams()}`
    );
    return response.data;
  }

  async getLists(boardId: string): Promise<List[]> {
    const response = await axios.get(
      `${this.baseUrl}/boards/${boardId}/lists?${this.getAuthParams()}`
    );
    return response.data;
  }

  async getCards(boardId: string, listId?: string): Promise<Card[]> {
    const endpoint = listId
      ? `${this.baseUrl}/lists/${listId}/cards`
      : `${this.baseUrl}/boards/${boardId}/cards`;
    const response = await axios.get(`${endpoint}?${this.getAuthParams()}`);
    return response.data;
  }

  async getCardDetails(cardId: string): Promise<CardDetails> {
    const response = await axios.get(
      `${this.baseUrl}/cards/${cardId}?${this.getAuthParams()}&attachments=true&members=true`
    );
    return response.data;
  }
}
