import path from "path";
import fs from "fs";

export default function handler(req, res) {
    const { filename } =  req.query;
    const filePath = path.join("/root/webserver/files", filename)

    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        fs.createReadStream(filePath).pipe(res);
    } else {
        res.status(404).send("File not found");
    }
}