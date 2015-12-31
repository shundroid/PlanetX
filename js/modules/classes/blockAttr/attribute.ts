class attribute {
  constructor(
    public label: string,
    public format: string,
    public type: string,
    public placeholder?:string,
    public defaultValue?:string
  ) {}
}
export = attribute;