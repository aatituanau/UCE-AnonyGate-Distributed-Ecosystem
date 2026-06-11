export interface EventBusPort {
  publish(topic: string, event: any): Promise<void>;
}

export const EVENT_BUS_PORT = Symbol('EVENT_BUS_PORT');
