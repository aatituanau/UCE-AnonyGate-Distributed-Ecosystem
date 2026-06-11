export class Complaint {
  constructor(
    public readonly id: string,
    public readonly aliasToken: string,
    public readonly payload: any,
    public readonly status: string,
    public readonly createdAt: Date,
  ) {}
}
