import Controller from "./Controller";
const formidable = require("formidable");
import fs from "fs/promises";
import { WriteStream } from "fs";
const { Writable } = require("stream");
export function formidableWrapper(controller: Controller) {
    console.log("RUN");
    return new Promise<any>((resolve, reject) => {
        console.log(
            "type",
            controller.req.headers["content-type"].split(";")[0]
        );
        if (
            controller.req.headers["content-type"].split(";")[0] !==
            "multipart/form-data"
        ) {
            resolve("");
            return;
        }
        const form = formidable({
            multiples: true,
            uploadDir: process.cwd() + "/tmp/",
        });

        const files = [];
        const fields = [];

        form.parse(controller.req, (err, fields, files) => {
            // @ts-ignore
            controller.req["body"] = fields;

            controller.req.files = files;
            resolve("test");
        });
    });
}
