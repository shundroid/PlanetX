class TrayBlockDetails {
  constructor(
    public blockName:string,
    public fileName:string,
    public label:string, // 表示するときのブロック名
    public width:number,
    public height:number
  ) { }
}
export = TrayBlockDetails;