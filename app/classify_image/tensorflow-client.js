'use strict'

const PRODUCTION = 'production'
const DEV = 'dev'
const ENVIRONMENT = process.env.SLOTHBUCKET_ENV || DEV
const DOCKER_IMAGE = process.env.SLOTHBUCKET_TENSORFLOW_DOCKER_NAME || 'imagenet-tensorflow'

const returnError = require('../errors/index')
const child_process = require('child_process')
const logger = require('../logging/index')

function copyFileToDockerContainer(filename) {
    return new Promise((resolve, reject) => {
        const remoteFilepath = `/root/images/${filename}`
        const program = 'docker'
        const commands = ['cp', `${filename}`, `${DOCKER_IMAGE}:${remoteFilepath}`]
        const config = {}

        child_process.execFile(program, commands, config, (err, result) => {
            if (err) {
                logger.log('error', err)
                reject(err)
            } else {
                resolve(remoteFilepath)
            }
        })
    })
}

function runTensorflowOnContainer(filename) {
    return new Promise((resolve, reject) => {
        const cmd = `docker exec ${DOCKER_IMAGE} bash -c "python /root/classify_image.py --image_file ${filename}"`
        const config = { cwd: '/' }

        child_process.exec(cmd, config, (err, result) => {
            if (err) {
                logger.log('error', err)
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

function removeImageFromContainer(filename) {
    return new Promise((resolve, reject) => {
        const cmd = `docker exec ${DOCKER_IMAGE} bash -c "rm ${filename}"`
        const config = { cwd: '/' }

        child_process.exec(cmd, config, (err, result) => {
            if (err) {
                logger.log('error', err)
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

/**
 * Locally it uses a locally running docker container with imagenet-tensorflow
 * @return {Promise}
 */
async function classifyImageLocally(filename) {
    let tensorflowOutput
    let remoteFilename
    try {
        remoteFilename = await copyFileToDockerContainer(filename)
        tensorflowOutput = await runTensorflowOnContainer(remoteFilename)
        await removeImageFromContainer(remoteFilename)
    } catch (exception) {
        logger.log('error', exception)
        return Promise.reject(returnError.internalError())
    }

    return tensorflowOutput
}

/**
 * Prod runs the app in the same Docker container as imagenet-tensorflow
 * @return {Promise}
 */
function classifyImageOnProd(filename) {
    return new Promise((resolve, reject) => {
        const filePath = '../slothbucket/' + filename
        // execute classify_image.py on the image file at the given file path
        child_process.execFile('python', ['classify_image.py', '--image_file', filePath], {
            cwd: '/root' // change working directory
        }, (error, result) => {
            if (error) {
                logger.log('error', error)
                reject(returnError.internalError())
            } else resolve(result)
        })
    })
}

/**
 * @param filename {string} - the full file path to the image to be uploaded, e.g. /path/to/file.jpg
 * @returns {Promise} that resolves to the TensorFlow output
 */
async function classifyImage(filename) {
    if (ENVIRONMENT === PRODUCTION) {
        return classifyImageOnProd(filename)
    } else {
        return classifyImageLocally(filename)
    }
}

module.exports.classifyImage = classifyImage
module.exports.ENV_PRODUCTION = PRODUCTION
module.exports.ENV_DEV = DEV
