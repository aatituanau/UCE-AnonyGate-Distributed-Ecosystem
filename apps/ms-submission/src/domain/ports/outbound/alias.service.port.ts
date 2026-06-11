export interface AliasServicePort {
  validateToken(token: string): Promise<boolean>;
}

export const ALIAS_SERVICE_PORT = Symbol('ALIAS_SERVICE_PORT');
