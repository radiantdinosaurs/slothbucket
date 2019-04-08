'use strict'

const returnError = require('../errors/index')
const logger = require('../logging/index')

/**
 * Parses the output of TensorFlow's script (classify_image.py) to JSON
 * @param {string} result - Output from classify_image.py
 * @returns {Object} - JSON object representing TensorFlow's result
 * @throws {Error} - Error object
 */
function parseTensorFlowResult(result) {
    if (result && typeof result === 'string') {
        let isSloth = false
        try {
            let resultLines = result.toString().split('\n')
            let resultObject = { image_labels: [], sloth_check: {} }
            resultLines.forEach(line => {
                if (line) {
                    let fields = line.split('(') // splits 'names' from 'score'
                    if (fields.length === 2) {
                        resultObject.image_labels.push({
                            name: fields[0].trim(),
                            score: fields[1].replace(/[^\d.]/g, '')
                        })
                        // check if the line contains a label for sloth with confidence higher than 70%
                        if (
                            fields[0].includes('sloth') &&
                            !fields[0].includes('Ursus ursinus')
                        ) {
                            if (fields[1].replace(/[^\d.]/g, '') > 0.7) {
                                isSloth = true
                            }
                        }
                    }
                }
            })
            resultObject.sloth_check.contains_sloth = isSloth
            return resultObject
        } catch (err) {
            logger.log('error', err)
            throw returnError.internalError()
        }
    } else {
        throw returnError.incompleteArguments()
    }
}

module.exports.parseTensorFlowResult = parseTensorFlowResult
