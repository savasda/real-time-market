import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

import { FinnhubService } from './finnhub.service';

interface SubscribePayload {
  symbol: string;
}

/**
 * WebSocket gateway that proxies Finnhub trade data to Angular clients.
 *
 * Protocol (client → server):
 *   { event: 'subscribe',   data: { symbol: 'AAPL' } }
 *   { event: 'unsubscribe', data: { symbol: 'AAPL' } }
 *
 * Protocol (server → client):
 *   Raw Finnhub trade JSON — { type: 'trade', data: [...] }
 *   Passed through as-is so the Angular parseFinnhubTradeMessage() works
 *   without any changes on the client side.
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class StockGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  /** Tracks which symbols each connected client has subscribed to. */
  private readonly clientSubs = new Map<WebSocket, Set<string>>();

  constructor(private readonly finnhubService: FinnhubService) {}

  afterInit(): void {
    // Broadcast every Finnhub message to all connected clients.
    this.finnhubService.messages.subscribe((msg) => {
      this.server.clients.forEach((client) => {
        if ((client as WebSocket).readyState === WebSocket.OPEN) {
          (client as WebSocket).send(msg);
        }
      });
    });
  }

  handleConnection(client: WebSocket): void {
    this.clientSubs.set(client, new Set());
  }

  handleDisconnect(client: WebSocket): void {
    const subs = this.clientSubs.get(client) ?? new Set<string>();
    subs.forEach((symbol) => this.finnhubService.unsubscribe(symbol));
    this.clientSubs.delete(client);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: SubscribePayload,
  ): void {
    const subs = this.clientSubs.get(client);
    if (!subs || subs.has(body.symbol)) return;

    subs.add(body.symbol);
    this.finnhubService.subscribe(body.symbol);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: SubscribePayload,
  ): void {
    const subs = this.clientSubs.get(client);
    if (!subs || !subs.has(body.symbol)) return;

    subs.delete(body.symbol);
    this.finnhubService.unsubscribe(body.symbol);
  }
}
