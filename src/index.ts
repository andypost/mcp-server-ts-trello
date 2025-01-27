#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';
import { TrelloClient } from './trello-client.js';
import { GetCardsRequest, GetListsRequest, GetCardDetailsRequest, UpdateCardRequest } from './types.js';

// Load environment variables
config();

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;

if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
  throw new Error('TRELLO_API_KEY and TRELLO_TOKEN environment variables are required');
}

class TrelloServer {
  private server: Server;
  private trelloClient: TrelloClient;

  constructor() {
    this.server = new Server(
      {
        name: 'trello-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.trelloClient = new TrelloClient(TRELLO_API_KEY as string, TRELLO_TOKEN as string);

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_boards',
          description: 'Get all boards for the authenticated user',
          inputSchema: {
            type: 'object',
            properties: {},
            title: 'get_boardsArguments',
          },
        },
        {
          name: 'get_lists',
          description: 'Get all lists in a board',
          inputSchema: {
            type: 'object',
            properties: {
              request: {
                type: 'object',
                properties: {
                  board_id: {
                    type: 'string',
                    description: 'ID of the board',
                  },
                },
                required: ['board_id'],
              },
            },
            required: ['request'],
            title: 'get_listsArguments',
          },
        },
        {
          name: 'get_cards',
          description: 'Get cards from a board or specific list',
          inputSchema: {
            type: 'object',
            properties: {
              request: {
                type: 'object',
                properties: {
                  board_id: {
                    type: 'string',
                    description: 'ID of the board',
                  },
                  list_id: {
                    type: 'string',
                    description: 'Optional ID of a specific list',
                  },
                },
                required: ['board_id'],
              },
            },
            required: ['request'],
            title: 'get_cardsArguments',
          },
        },
        {
          name: 'get_card_details',
          description: 'Get detailed information about a specific card',
          inputSchema: {
            type: 'object',
            properties: {
              request: {
                type: 'object',
                properties: {
                  card_id: {
                    type: 'string',
                    description: 'ID of the card',
                  },
                },
                required: ['card_id'],
              },
            },
            required: ['request'],
            title: 'get_card_detailsArguments',
          },
        },
        {
          name: 'update_card',
          description: 'Update properties of a specific card',
          inputSchema: {
            type: 'object',
            properties: {
              request: {
                type: 'object',
                properties: {
                  card_id: {
                    type: 'string',
                    description: 'ID of the card',
                  },
                  update_data: {
                    type: 'object',
                    description: 'Properties to update on the card',
                    additionalProperties: true,
                  },
                },
                required: ['card_id', 'update_data'],
              },
            },
            required: ['request'],
            title: 'update_cardArguments',
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_boards':
            const boards = await this.trelloClient.getBoards();
            return {
              content: [{ type: 'text', text: JSON.stringify(boards, null, 2) }],
            };

          case 'get_lists': {
            const { board_id } = (request.params.arguments as { request: GetListsRequest }).request;
            const lists = await this.trelloClient.getLists(board_id);
            return {
              content: [{ type: 'text', text: JSON.stringify(lists, null, 2) }],
            };
          }

          case 'get_cards': {
            const { board_id, list_id } = (request.params.arguments as { request: GetCardsRequest }).request;
            const cards = await this.trelloClient.getCards(board_id, list_id);
            return {
              content: [{ type: 'text', text: JSON.stringify(cards, null, 2) }],
            };
          }

          case 'get_card_details': {
            const { card_id } = (request.params.arguments as { request: GetCardDetailsRequest }).request;
            const cardDetails = await this.trelloClient.getCardDetails(card_id);
            return {
              content: [{ type: 'text', text: JSON.stringify(cardDetails, null, 2) }],
            };
          }

          case 'update_card': {
            const { card_id, update_data } = (request.params.arguments as { request: UpdateCardRequest }).request;
            const updatedCard = await this.trelloClient.updateCard(card_id, update_data);
            return {
              content: [{ type: 'text', text: JSON.stringify(updatedCard, null, 2) }],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Trello MCP server running on stdio');
  }
}

const server = new TrelloServer();
server.run().catch(console.error);
