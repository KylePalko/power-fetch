import HEADERS from './constants/headers'
import ERRORS from './constants/errors'
import isValidInput from './func/isValidInput'

export default ({ url, method, body, headers = HEADERS.JSON, numberOfAttempts = 1, timeBetweenAttempts = 0, timeBeforeTimeout = 0 }, handle) => {

    try {
        isValidInput({ url, method, headers, numberOfAttempts, timeBetweenAttempts, timeBeforeTimeout })
    } catch (err) {
        return { cancel: () => {}, response: new Promise((resolve, reject) => reject(err)) }
    }

    let cancel = () => { }

    return {
        cancel: () => cancel(),
        response: new Promise((promiseResolve, promiseReject) => {

            const errors = []

            let currentAttempts = 0,
                timeout

            const reject = (err) => {

                clearTimeout(timeout)
                errors.push(err)

                if (err === ERRORS.CANCEL || err === ERRORS.REQUEST_FAILED) {
                    promiseReject(errors)
                } else if (currentAttempts >= numberOfAttempts) {
                    promiseReject(errors)
                } else {
                    call()
                }
            }

            const resolve = (data) => {
                clearTimeout(timeout)
                promiseResolve(data)
            }

            const call = () => setTimeout(() => {

                currentAttempts++

                const req = new XMLHttpRequest();

                cancel = () => {
                    req.abort()
                    reject(ERRORS.CANCEL)
                }

                req.open(method, url, true);

                req.addEventListener("load", (e) => {

                    let json = null
                    try {
                        json = JSON.parse(req.responseText)
                    } catch (err) { }

                    handle({
                        headers: req.headers,
                        status: req.status,
                        json,
                        text: req.responseText,
                        resolve,
                        reject
                    })
                })

                req.addEventListener("error", (e) => {
                    /* If status is unsent the request likely could not be sent due to
                     * lack of an internet connection, but we return request-failed
                     * to account for other reasons. */
                    if (e.target.status === e.target.UNSENT) {
                        req.abort()
                        reject(ERRORS.REQUEST_FAILED)
                    } else {
                        reject(e.target._response)
                    }
                })

                for (let key of Object.keys(headers)) {
                    req.setRequestHeader(key, headers[key]);
                }

                req.send(JSON.stringify(body));

                if (timeBeforeTimeout !== 0) {
                    timeout = setTimeout(function () {
                        req.abort()
                        reject(ERRORS.TIMEOUT)
                    }, timeBeforeTimeout)
                }
            }, currentAttempts === 0 ? 0 : timeBetweenAttempts)

            call()
        })
    }
}