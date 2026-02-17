declare module 'pg' {
  export class Pool {
    constructor(config: any);
    connect(): Promise<any>;
    query(text: string, params?: any[]): Promise<any>;
    end(): Promise<void>;
  }
  
  export class PoolClient {
    query(text: string, params?: any[]): Promise<any>;
    release(): void;
  }
}