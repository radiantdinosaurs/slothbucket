"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const child_process = require("child_process");
const fs = require("fs");
const pngToJpeg = require("png-to-jpeg");

app.set("port", (process.env.PORT || 8000)); // set server to use preconfigured port or 8000
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));

/**
 * Writes a base64 string for a JPEG file to disk as a JPEG file
 * @param {string} base64String - base64 string of JPEG file
 */
function writeJpegToDisk(base64String) {
    let base64Data = base64String.replace(/^data:image\/jpeg;base64,/, ""); // stripping for decoding
    // writing file to disk as "out.jpeg"
    fs.writeFile("out.jpeg", base64Data, "base64", function (error) {
        if (error !== null) {
            console.log(error);
        }
    });
}

/**
 * Writes a base64 string for a PNG file to disk as a JPEG file
 * @param {string} base64String - base64 string of PNG file
 */
function writePngToDisk(base64String) {
    const buffer = new Buffer(base64String.split(/,\s*/)[1], "base64");
    // using middleware to change image from PNG to JPEG
    pngToJpeg({quality: 90})(buffer).then(function (output) {
        // writing file to disk as "out.jpeg"
        fs.writeFile("out.jpeg", output, function (error) {
            if (error !== null) {
                console.log(error);
            }
        });
    });
}

/**
 * Confirms the file type of a base64 string, whether PNG, JPEG, or other
 * @param {string} base64String - base64 string of file
 * @returns {string} fileType - assignment of file type, which will either be PNG, JPEG, or undefined
 */
function checkFileType(base64String) {
    let fileType = base64String.substring(0, 15); // getting the data/image type label
    if (fileType.includes("png")) {
        return "PNG"; // image is a PNG
    } else if (fileType.includes("jpeg")) {
        return "JPEG"; // image is a JPEG
    } else {
        return "undefined"; // image is not PNG or JPEG, so set as "undefined," because it cannot be used
    }
}

/**
 * Parses the output of the TensorFlow trained model script (classify_image.py) to a JSON object
 * @param {string} result - Output from classify_image.py
 */
function parseTensorFlowResult(result) {
    let sloth = false; // true if image contains a sloth
    let resultLines = result.toString().split("\n"); // splitting up TensorFlow's result by newline
    let resultObject = {"image_labels": [], "sloth_check": []}; // JSON object that will hold all the data
    // iterating through each line from TensorFlow's result to fill up the JSON object
    resultLines.forEach(function (line) {
        if (line !== null && line !== undefined && line !== "") {
            let fields = line.split("("); // splits "names" from "score"
            resultObject.image_labels.push({
                "name": fields[0].trim(), // remove trailing whitespaces
                "score": fields[1].replace(/[^\d.]/g, "") // remove all except numbers and decimal points
            });
            // check if the line contains a label for sloth with confidence higher than 70%
            if(fields[0].includes("sloth") && !fields[0].includes("Ursus ursinus")) {
                if(fields[1].replace(/[^\d.]/g, "") > 0.70) {
                    sloth = true;
                }
            }
        }
    });
    resultObject.sloth_check.push({
        "contains_sloth": sloth
    });
    return resultObject;
}

/**
 * Handles passing the base64 string to all proper methods, which includes checking its file type and writing the
 * file to disk
 * @param {string} base64String - base64 string of file
 * @returns {*} - file path if the argument provided was PNG or JPEG, null otherwise
 */
function processImage(base64String) {
    let fileType = checkFileType(base64String); // checking the file type of the base64
    if (fileType.includes("PNG")) {
        writePngToDisk(base64String);
    } else if (fileType.includes("JPEG")) {
        writeJpegToDisk(base64String);
    } else {
        return null; // return null if the file type isn't PNG or JPEG
    }
    return "../slothbucket/out.jpeg"; // return file path if the file type is PNG or JPEG
}

// HTTP POST for any TensorFlow image recognition with bonus sloth check
app.post("/sloth-check", function (req, res) {
    if(req.body.base64 !== null && req.body.base64 !== undefined) {
        let filePath = processImage(req.body.base64); // sending to this function to check file type and save to disk
        if (filePath !== null) {
            // commands to run TensorFlow
            child_process.execFile("python", ["classify_image.py", "--image_file", filePath], {
                cwd: "../root" // change working directory
            }, function (error, result) {
                if (error !== null) {
                    console.log(error);
                }
                res.status(200).send(parseTensorFlowResult(result)); // success
            });
        } else {
            // if filePath is null, that means the image wasn't able to be processed (e.g., it wasn't a JPEG or PNG)
            res.status(500).send({status:500, message:"File type not supported"});
        }
    }
    else {
        // body was undefined or null
        res.status(500).send({status:500, message:"Cannot read undefined body"});
    }
});


// listening for connections on variable 'port'
app.listen(app.get("port"), function () {
    console.log("App is running, server is listening on port", app.get("port"));
});