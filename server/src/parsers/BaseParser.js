export class BaseParser {
  canParse(file) {
    throw new Error(`${this.constructor.name}.canParse() is not implemented`);
  }

  async *parse(file) {
    throw new Error(`${this.constructor.name}.parse() is not implemented`);
  }
}
