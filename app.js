"use strict";

const express = require("express"); // web application framework
const app = express();
const child_process = require("child_process");

// set server to use preconfigured port or 8000
app.set("port", (process.env.PORT || 8000));

/**
 * Parses the output of the TensorFlow trained model script (classify_image.py) to a JSON object
 * @param {string} result - Output from classify_image.py
 */
function parseTensorFlowResult(result) {
    let resultLines = result.toString().split("\n");
    let resultObject = {"image_labels": []};
    resultLines.forEach(function (line) {
        if (line !== null && line !== undefined && line !== "") {
            let fields = line.split("(");
            return resultObject.image_labels.push({
                "name": fields[0].replace(/\s/g, ""),
                "score": fields[1].replace(/[^\d.]/g, "")
            });
        }
    });
}

// HTTP GET root path
app.get("/", function (req, res) {
    res.send("Hello world!");
});

// HTTP get test path (temporary path for manual testing)
app.get("/test", function (req, res) {
    child_process.execFile("python", ["classify_image.py"], {
        cwd: "../root"
    }, function (error, result) {
        parseTensorFlowResult(result);
        res.send(result.toString().split("\n"));
    });
});

// listening for connections on variable 'port'
app.listen(app.get("port"), function () {
    console.log("App is running, server is listening on port", app.get("port"));
});
