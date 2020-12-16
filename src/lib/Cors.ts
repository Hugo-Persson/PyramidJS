import Controller from "./Controller";

export default async function cors(controller: Controller) {
    controller.res
        .getNodeResponseObject()
        .setHeader("Access-Control-Allow-Origin", "*");
    controller.res
        .getNodeResponseObject()
        .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    controller.res
        .getNodeResponseObject()
        .setHeader("Access-Control-Max-Age", 2592000);
    controller.res
        .getNodeResponseObject()
        .setHeader("Access-Control-Allow-Headers", "*");
}
