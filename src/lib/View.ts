import pug from "pug";

export default abstract class View {
    private compileFunction: pug.compileTemplate;
    constructor(pathToPug: string) {
        this.compileFunction = pug.compileFile("./src/views/" + pathToPug);
    }
    public render() {
        return this.compileFunction(this);
    }
}
