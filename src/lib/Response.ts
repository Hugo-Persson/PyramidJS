import http from "http";
import path from "path";
import fs, { ReadStream } from "fs";
import mime from "mime-types";
import View from "./View";

export default class Response extends http.ServerResponse {
    public sendingFile: boolean = false;

    public jsonAddData: any = {};

    constructor(req: http.IncomingMessage) {
        super(req);
    }
    /**
     * @param {string} message - The message you want to send to the user
     * @description - This method will send a string to the user
     */
    send(message: string): void {
        this.write(message);
    }
    /**
     * @param {string} absolutePath - The absolute path to the file you want to send to the user
     * @param {string} [mimeType] - The mime-type, if no mime-type is specified an automatic mime-type will be used
     * @description - This method will send a file to the user, use this if you want the the file to be opened in the browser. If you want the file to be downloaded use .download()
     */
    sendFile(absolutePath: string, mimeType?: string): void {
        mimeType =
            mimeType || mime.lookup(absolutePath) || "application/octet-stream";
        const stat = fs.statSync(absolutePath);
        this.writeHead(200, {
            "Content-Type": mimeType,
            "Content-Length": stat.size,
        });
        const readStream: ReadStream = fs.createReadStream(absolutePath);
        readStream.pipe(this);
        this.sendingFile = true;
    }
    /**
     * @param {string} absolutePath - The absolute path to the file you want to send to the user
     * @param {string} [mimeType] - The mime-type, if no mime-type is specified an automatic mime-type will be used
     * @description - This method will prompt a user to download a file, the file will be downloaded if you want to open the file in the browser use .send()
     */
    download(absolutePath: string, mimeType?: string): void {
        mimeType =
            mimeType || mime.lookup(absolutePath) || "application/octet-stream";
        const stat = fs.statSync(absolutePath);
        this.writeHead(200, {
            "Content-Type": mimeType,
            "Content-Length": stat.size,
            "Content-Disposition": "attachment",
            filename: path.basename(absolutePath),
        });
        const readStream: ReadStream = fs.createReadStream(absolutePath);
        readStream.pipe(this);
        this.sendingFile = true;
    }

    /**
     * Will send a object as JSON to the client - no other data can be sent after this
     * @param data A object that will be converted to JSON and sent to the client with json content type
     */
    json(data: object): void {
        this.writeHead(200, {
            "Content-Type": "application/json",
        });
        this.send(JSON.stringify(Object.assign(data, this.jsonAddData)));
    }
    /**
     * Will render a view object and send the rendered content to the client data should already have been passed to the object
     * @param view An instance of the view object you want to render
     */
    render(view: View) {
        this.writeHead(200, { "Content-Type": "text/html" });
        this.send(view.render());
    }

    /**
     *
     * @param key The key for the cookie, will be used whenever you want to access your cookie -- NOTE: Formatting is important no spaces are allowed
     * @param value The value that will be kept for the cookie
     * @param options Different options how the cookie will be stored, currently only path is supported
     */
    setCookie(key: string, value: string, options?: CookieOptions) {
        // TODO: Remove whitespace from key
        let cookieData = key + "=" + value;
        if (options) {
            if (options.path) {
                cookieData += ";Path=" + options.path;
            }
        }
        this.setHeader("Set-Cookie", cookieData);
    }

    setStatusCode(code: number) {
        this.statusCode = code;
    }
}

export interface CookieOptions {
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: SameSite;
}
enum SameSite {
    strict = "Strict",
    lax = "Lax",
    noen = "None",
}
