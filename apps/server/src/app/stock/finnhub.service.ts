import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import { WebSocket } from 'ws';

@Injectable()
export class FinnhubService implements OnModuleInit {
  private readonly logger = new Logger(FinnhubService.name);
  private readonly messagesSubject = new Subject<string>();
  readonly messages = this.messagesSubject.asObservable();
  private readonly refCounts = new Map<string, number>();

  private ws: WebSocket | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.connect();
  }

  subscribe(symbol: string): void {
    const count = (this.refCounts.get(symbol) ?? 0) + 1;
    this.refCounts.set(symbol, count);

    if (count === 1 && this.isOpen()) {
      this.ws!.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  unsubscribe(symbol: string): void {
    const count = (this.refCounts.get(symbol) ?? 0) - 1;

    if (count <= 0) {
      this.refCounts.delete(symbol);
      if (this.isOpen()) {
        this.ws!.send(JSON.stringify({ type: 'unsubscribe', symbol }));
      }
    } else {
      this.refCounts.set(symbol, count);
    }
  }

  private connect(): void {
    const token = this.config.getOrThrow<string>('FINNHUB_TOKEN');
    this.ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);

    this.ws.on('open', () => {
      this.logger.log('Connected to Finnhub WebSocket');
      for (const symbol of this.refCounts.keys()) {
        this.ws!.send(JSON.stringify({ type: 'subscribe', symbol }));
      }
    });

    this.ws.on('message', (data: Buffer) => {
      this.messagesSubject.next(data.toString());
    });

    this.ws.on('close', () => {
      this.logger.warn('Finnhub WS closed – reconnecting in 5 s');
      setTimeout(() => this.connect(), 5000);
    });

    this.ws.on('error', (err: Error) => {
      this.logger.error(`Finnhub WS error: ${err.message}`);
    });
  }

  private isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
