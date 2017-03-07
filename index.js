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

                if (numberOfAttempts == 0) {
                    call()
                }
                if (currentAttempts >= numberOfAttempts || err === 'cancel') {
                    if (numberOfAttempts != 0 && err != 'cancel') {
                        promiseReject(errors)
                    }
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

                let json
                try {
                    json = JSON.parse(req.responseText)
                } catch (err) {
                    json = {}
                }

                req.addEventListener("load", (e) => {
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

const STATUS_CODES = {
    CONTINUE: 100,
    OK: 200,
    NON_AUTHORITATIVE_INFORMATION: 203,
    PARTIAL_CONTENT: 206,
    IM_USED: 226,
    MULTIPLE_CHOICES: 300,
    SEE_OTHER: 303,
    UNUSED: 306,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    REQUEST_ENTITY_TOO_LARGE: 413,
    REQUEST_URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    REQUESTED_RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    IM_A_TEAPOT: 418,
    ENHANCE_YOUR_CALM: 420,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    RESERVED_FOR_WEBDAV: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    NO_RESPONSE: 444,
    RETRY_WITH: 449,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,
    CLIENT_CLOSED_REQUEST: 499,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE: 507,
    LOOP_DETECTED: 508,
    BANDWIDTH_LIMIT_EXCEEDED: 509,
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511,
    NETWORK_READ_TIMEOUT_ERROR: 598,
    NETWORK_CONNECTION_TIMEOUT_ERROR: 599
}

export { HEADERS, METHODS, STATUS_CODES }