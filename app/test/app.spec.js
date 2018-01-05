'use strict'

const expect = require('chai').expect
const tensorflowResultParsing = require('../utils/tensorflow/parse-tensorflow')

describe('tensorflowResultParsing', () => {
    after(() => {
        process.exit()
    })

    describe('parseTensorFlowResult', () => {
        const singleLine = 'lesser panda, red panda, panda, bear cat, cat bear, Ailurus fulgens (score = 0.00264)'
        const multipleLines = 'lesser panda, red panda, panda, bear cat, cat bear, Ailurus fulgens (score = 0.00264)\n' +
            'custard apple (score = 0.00141)'
        it('should return a JSON object with keys \'image_labels\' and \'sloth_check\' given a one line result from TensorFlow', () => {
            expect(tensorflowResultParsing.parseTensorFlowResult(singleLine)).to.be.an('object').that.has.all.keys('image_labels', 'sloth_check')
        })
        it('should return a JSON object with keys \'image_labels\' and \'sloth_check\' given a multiple line result from TensorFlow', () => {
            expect(tensorflowResultParsing.parseTensorFlowResult(multipleLines)).to.be.an('object').that.has.all.keys('image_labels', 'sloth_check')
        })
    })
})
