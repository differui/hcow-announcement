export abstract class Collector {
  public abstract parse(message: string): void;
  public abstract validate(): string;
  public abstract toJS(): any;
}
