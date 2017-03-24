import METHODS from '../constants/methods'

export default ({ url, method, headers, numberOfAttempts, timeBetweenAttempts, timeBeforeTimeout }) => {
    if (url === null || url === '') {
        throw `{ url } parameter required`
    } else if (method === null || method === '') {
        throw `{ method } parameter required`
    } else if (METHODS[method] === null) {
        throw `Expecting { method } parameter to be ${Object.keys(METHODS)}`
    } else if (new RegExp(!/^https?:\/\//, 'i').test(url)) {
        throw `{ url } parameter must begin with http:// or https://`
    }
    return true
}