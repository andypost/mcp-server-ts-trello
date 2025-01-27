export interface Board {
  id: string;
  name: string;
  desc: string;
  url: string;
}

export interface List {
  id: string;
  name: string;
  closed: boolean;
  pos: number;
}

export interface Card {
  id: string;
  name: string;
  desc: string;
  url: string;
  pos: number;
  closed: boolean;
  due: string | null;
  idList: string;
  idBoard: string;
}

export interface CardDetails extends Card {
  labels: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  members: Array<{
    id: string;
    fullName: string;
    username: string;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

export interface GetListsRequest {
  board_id: string;
}

export interface GetCardsRequest {
  board_id: string;
  list_id?: string;
}

export interface GetCardDetailsRequest {
  card_id: string;
}
