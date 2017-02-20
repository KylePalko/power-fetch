export default ({ url, method, headers = HEADERS.JSON, numberOfAttempts = 1, timeBetweenAttempts = 0, timeBeforeTimeout = 0 }, handle) => {

    if (url == null || url == '') {
        throw `{ url } parameter required`
    } else if (method == null || method == '') {
        throw `{ method } parameter required`
    } else if (METHODS[method] == null) {
        throw `Expecting { method } parameter to be ${Object.keys(METHODS)}`
    } else if (new RegExp(!/^https?:\/\//, 'i').test(url)) {
        throw `{ url } parameter must begin with http:// or https://`
    }

    let cancel = () => { console.warn('Cancel was called before connection could start') }

    return {
        cancel,
        response: new Promise((promiseResolve, promiseReject) => {

            const errors = []

            let currentAttempts = 0,
                timeout

            const reject = (err) => {

                clearTimeout(timeout)

                errors.push(err)

                if (currentAttempts >= numberOfAttempts || err === 'cancel') {
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
                    handle({
                        headers: req.headers,
                        status: req.status,
                        json: JSON.parse(req.responseText),
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

                if (timeBeforeTimeout != 0) {
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

const HEADERS = {
    JSON: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}

const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
}

export { HEADERS, METHODS }