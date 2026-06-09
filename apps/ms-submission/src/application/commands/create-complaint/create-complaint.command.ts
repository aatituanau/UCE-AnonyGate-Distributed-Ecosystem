export class CreateComplaintCommand {
  constructor(
    public readonly aliasToken: string,
    public readonly payload: any,
  ) {}
}
