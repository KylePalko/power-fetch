import HEADERS from './constants/headers'
import isValidInput from './func/isValidInput'


export default ({ url, method, headers = HEADERS.JSON, numberOfAttempts = 1, timeBetweenAttempts = 0, timeBeforeTimeout = 0 }, handle) => {

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

                if (err === 'cancel') {
                    promiseReject(errors)
                } else if (currentAttempts >=numberOfAttempts) {
                    promiseReject(errors)
                } else {
                    call()
                }
            }

            cancel = () => reject('cancel')

            const resolve = (data) => {
                clearTimeout(timeout)
                promiseResolve(data)
            }

            const call = () => setTimeout(() => {

                currentAttempts++

                const req = new XMLHttpRequest();

                this.abort = req.abort

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
                    reject(e.target._response)
                })

                for (let key of Object.keys(headers)) {
                    req.setRequestHeader(key, headers[key]);
                }

                req.send(null);

                if (timeBeforeTimeout !== 0) {
                    timeout = setTimeout(function () {
                        req.abort()
                        reject('timeout')
                    }, timeBeforeTimeout)
                }
            }, currentAttempts === 0 ? 0 : timeBetweenAttempts)

            call()
        })
    }
}