import http from "http";
import path from "path"
import fs, { ReadStream } from "fs";
import mime from "mime-types";



export default class Response {
    private res: http.ServerResponse;
    public sendingFile: boolean = false;
    constructor(res: http.ServerResponse) {
        this.res = res;
    }
    /**
     * @param {string} message - The message you want to send to the user
     * @description - This method will send a string to the user
     */
    send(message: any): void {
        this.res.write(message);
    }
    /**
     * @param {string} absolutePath - The absolute path to the file you want to send to the user
     * @param {string} [mimeType] - The mime-type, if no mime-type is specified an automatic mime-type will be used 
     * @description - This method will send a file to the user, use this if you want the the file to be opened in the browser. If you want the file to be downloaded use .download()
     */
    sendFile(absolutePath: string, mimeType?: string): void {
        mimeType = mimeType || mime.lookup(absolutePath) || "application/octet-stream";
        const stat = fs.statSync(absolutePath);
        this.res.writeHead(200, {
            "Content-Type": mimeType,
            "Content-Length": stat.size,
        });
        const readStream: ReadStream = fs.createReadStream(absolutePath);
        readStream.pipe(this.res);
        this.sendingFile = true;

    }
    /**
     * @param {string} absolutePath - The absolute path to the file you want to send to the user
        * @param {string} [mimeType] - The mime-type, if no mime-type is specified an automatic mime-type will be used 
     * @description - This method will prompt a user to download a file, the file will be downloaded if you want to open the file in the browser use .send()
     */
    download(absolutePath: string, mimeType?: string): void {
        mimeType = mimeType || mime.lookup(absolutePath) || "application/octet-stream";
        const stat = fs.statSync(absolutePath);
        this.res.writeHead(200, {
            "Content-Type": mimeType,
            "Content-Length": stat.size,
            "Content-Disposition": "attachment",
            "filename": path.basename(absolutePath)
        });
        const readStream: ReadStream = fs.createReadStream(absolutePath);
        readStream.pipe(this.res);
        this.sendingFile = true;
    }

    /**
     * @returns {http.ServerResponse} Returns the original nodejs res object
     * @description - Use this file if you want access to the original nodejs if MyFramework doesn't support the specific feature you want
     */
    getNodeResponseObject(): http.ServerResponse {
        return this.res;
    }
    /**
     * @description - Will end the transmission to the client, only use this if you know what you are doing
     */
    end(): void {
        this.res.end();
    }

}
