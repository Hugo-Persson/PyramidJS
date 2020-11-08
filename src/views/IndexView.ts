import View from "@lib/View";

export default class IndexView extends View {
    public name: string;
    constructor(name: string) {
        super("index.pug");
        this.name = name;
    }
}
