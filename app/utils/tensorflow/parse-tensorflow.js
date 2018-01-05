/**
 * Parses the output of TensorFlow's script (classify_image.py) to JSON
 * @param {string} result - Output from classify_image.py
 * @returns {Object} - JSON object representing TensorFlow's result
 */
const parseTensorFlowResult = function(result) {
    if (result) {
        let sloth = false // true if image contains a sloth
        let resultLines = result.toString().split('\n') // splitting up TensorFlow's result by newline
        let resultObject = {'image_labels': [], 'sloth_check': []} // JSON object that will hold all the data
        resultLines.forEach(line => { // iterating through each line from TensorFlow's result to fill up the JSON object
            if (line) {
                let fields = line.split('(') // splits 'names' from 'score'
                resultObject.image_labels.push({
                    'name': fields[0].trim(), // remove trailing whitespaces
                    'score': fields[1].replace(/[^\d.]/g, '') // remove all except numbers and decimal points
                })
                // check if the line contains a label for sloth with confidence higher than 70%
                if (fields[0].includes('sloth') && !fields[0].includes('Ursus ursinus')) {
                    if (fields[1].replace(/[^\d.]/g, '') > 0.70) {
                        sloth = true
                    }
                }
            }
        })
        resultObject.sloth_check.push({
            'contains_sloth': sloth
        })
        return resultObject
    } else {
        let error = new Error('Cannot parse undefined argument.')
        error.code = 400
        return error
    }
}

module.exports.parseTensorFlowResult = parseTensorFlowResult
