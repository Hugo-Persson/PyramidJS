import { Mode } from "fs";
import { Model } from "./Model";

export default interface IJunctionTable extends Model {
    firstClassDef: new () => Model;
    secondClassDef: new () => Model;

    getFirst: IReturnModel;
    getSecond: IReturnModel;
}
interface IReturnModel {
    (): Promise<Model>;
}
