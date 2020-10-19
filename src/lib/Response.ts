import http from "http";
import fs, { ReadStream } from "fs";
import mime from "mime-types";
export default class Response {
    private res: http.ServerResponse;
    public sendingFile : boolean = false;
    constructor(res: http.ServerResponse) {
        this.res = res;
    }

    send(message: any): void {
        this.res.write(message);
    }
    sendFile(path: string, mimeType?: string): void {
        mimeType = mimeType || mime.lookup(path) || "application/octet-stream";
        const stat = fs.statSync(path);
        this.res.writeHead(200, {
            "Content-Type": mimeType,
            "Content-Length": stat.size,
        });
        const readStream: ReadStream = fs.createReadStream(path);
        readStream.pipe(this.res);
        this.sendingFile=true;
        
    }
    end() {
        this.res.end();
    }
}
