export class Complaint {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly faculty: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly aliasId: string,
  ) {}
}
