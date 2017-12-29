"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const child_process = require("child_process");
const fs = require("fs");
const pngToJpeg = require("png-to-jpeg"); // used for saving base64 png as jpeg
const uuid = require("uuid/v4"); // universally unique identifier, used for file names

app.set("port", (process.env.PORT || 8000)); // set server to use preconfigured port or 8000
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));

/**
 * Parses the output of the TensorFlow trained model script (classify_image.py) to a JSON object
 * @param {string} result - Output from classify_image.py
 */
function parseTensorFlowResult(result) {
    let sloth = false; // true if image contains a sloth
    let resultLines = result.toString().split("\n"); // splitting up TensorFlow's result by newline
    let resultObject = {"image_labels": [], "sloth_check": []}; // JSON object that will hold all the data
    // iterating through each line from TensorFlow's result to fill up the JSON object
    resultLines.forEach(line => {
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
 * Writes a base64 string for a JPEG file to disk as a JPEG file
 * @param {string} base64String - base64 string of JPEG file
 * @param {string} fileName - UUID to save as file name
 */
function writeJpegToDisk(base64String, fileName) {
    if(base64String !== null && fileName !== null && base64String !== undefined && fileName !== undefined &&
        base64String !==  "" && fileName !== "") {
        const base64Data = base64String.replace(/^data:image\/jpeg;base64,/, ""); // stripping for decoding
        // writing file to disk with UUID as file name
        fs.writeFile(fileName, base64Data, "base64", (error) => {
            if (error !== null) {
                let error = new Error("Internal error while trying to save file to disk");
                error.code = 500;
                return error;
            }
        });
    }
    else {
        let error = new Error("Cannot write file to disk if arguments are null, undefined, or empty");
        error.code = 400;
        return error;
    }
}

/**
 * Writes a base64 string for a PNG file to disk as a JPEG file
 * @param {string} base64String - base64 string of PNG file
 * @param {string} fileName - UUID to save as file name
 */
function writePngToDisk(base64String, fileName) {
    if(base64String !== null && fileName !== null && base64String !== undefined && fileName !== undefined &&
        base64String !==  "" && fileName !== "") {
        const buffer = new Buffer(base64String.split(/,\s*/)[1], "base64");
        // using middleware to change image from PNG to JPEG
        pngToJpeg({quality: 90})(buffer).then((output) => {
            // writing file to disk with UUID as file name
            fs.writeFile(fileName, output, function (error) {
                if (error !== null) {
                    let error = new Error("Internal error while trying to save file to disk");
                    error.code = 500;
                    return error;
                }
            });
        });
    }
    else {
        let error = new Error("Cannot write file to disk if arguments are null, undefined, or empty");
        error.code = 400;
        return error;
    }
}

/**
 * Checks if base64 string contains a file that is JPEG, PNG, or other
 * @param {string} base64String - base64 string of file
 * @returns {boolean} - true if JPEG and false if PNG
 */
function checkIfBase64IsJpeg(base64String) {
    if(base64String !== null && base64String !== undefined && base64String !== "") {
        let fileType = base64String.substring(0, 15); // getting the data/image type label
        if (fileType.includes("png")) {
            return false; // image is a PNG
        } else if (fileType.includes("jpeg")) {
            return true; // image is a JPEG
        } else {
            let error = new Error("File type isn't PNG or JPEG. Only JPEG and PNG images are allowed.");
            error.code = 400;
            return error; // image is not PNG or JPEG, so it cannot be used
        }
    }
}

/**
 * Handles passing the base64 string to all proper methods, which includes checking its file type and writing the
 * file to disk
 * @param {string} base64String - base64 string of file
 * @returns {*} - file path if the argument provided was PNG or JPEG, null otherwise
 */
function processImage(base64String) {
    if(base64String !== null && base64String !== undefined && base64String !== "") {
        const fileType = checkIfBase64IsJpeg(base64String); // checking the file type of the base64
        // throws an error if file type is not compatible
        if(fileType instanceof Error) {
            return fileType;
        }
        else {
            const fileName = uuid() + ".jpeg";
            // call writeJpegToDisk if true or writePngToDisk if false
            let writeFile = fileType ? writeJpegToDisk(base64String, fileName) : writePngToDisk(base64String, fileName);
            if(writeFile instanceof Error) {
                throw writeFile;
            }
            else {
                return "../slothbucket/" + fileName; // file path
            }
        }
    }
    else {
        let error = new Error("Cannot process null, undefined, or empty string arguments");
        error.code = 400;
        return error;
    }
}

// HTTP POST for any TensorFlow image recognition with bonus sloth check
app.post("/sloth-check", (req, res) => {
    if(req.body.base64 !== null && req.body.base64 !== undefined && req.body.base64 !== "") {
        let filePath = processImage(req.body.base64); // sending to check file type and save to disk
        if (filePath instanceof Error) {
            // if there's an error, that means the image wasn't able to be processed (e.g., it wasn't a JPEG or PNG)
            res.status(200).send({status: filePath.code, message: filePath.message});
        }
        else {
            // commands to run the TensorFlow script
            child_process.execFile("python", ["classify_image.py", "--image_file", filePath], {
                cwd: "../root" // change working directory
            }, function (error, result) {
                if (error !== null) {
                    res.status(500)
                        .send({status: 500, message: "Internal error encountered while running TensorFlow script."});
                }
                else {
                    res.status(200).send(parseTensorFlowResult(result)); // success
                }
            });
        }
    }
    else {
        // if the body was null, undefined, or empty
        res.status(400).send({status:400, message: "Cannot read null, empty, or undefined body. " +
            "Please format as \"{\"base64\": \"(your base64 here)\"}\"."});
    }
});


// listening for connections on variable 'port'
app.listen(app.get("port"), function () {
    console.log("App is running, server is listening on port", app.get("port"));
});