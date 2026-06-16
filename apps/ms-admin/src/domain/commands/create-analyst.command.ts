export class CreateAnalystCommand {
  constructor(
    public readonly email: string,
    public readonly passwordHash: string,
  ) {}
}
