export interface NlpEventBusPort {
  publishNlpRequested(complaintId: string, aliasToken: string, text: string): Promise<void>;
}

export const NLP_EVENT_BUS_PORT = Symbol('NLP_EVENT_BUS_PORT');
