# Power Fetch for React Native

Power Fetch is built on XMLHttpRequest to allow true cancel/abort of your connection.

_NOTE: Power Fetch currently on supports JSON bodies and applies `JSON.stringify()` to them internally (do not stringify your payload)._

### 1. Create a function to abstract your API call

```
import fetch, { METHODS, HEADERS, STATUS_CODES } from 'power-fetch'

const getIp = () => {
    return fetch({
        url: 'http://ip.jsontest.com/',
        method: METHODS.GET,
        headers: {
            ...HEADERS.JSON
        },
        numberOfAttempts: 5, // Setting this to 0 will set the fetch to try indefinitely.
        timeBeforeTimeout: 2000,
        timeBetweenAttempts: 5000
    }, callback)
}
```

### 2. Create your callback function
Simply resolve or reject to complete your callback. If you reject `power-fetch` will make another request until your total `numberOfAttempts` is reached. If you resolve `power-fetch` will immediately return with the argument passed to the `resolve` function.
```
const callback = ({ headers, status, json, resolve, reject }) => {
    switch (status) {
        case STATUS_CODES.OK:
            return resolve(json)
        default:
            return reject('unknown-api-error')
    }
})
```

### 3. Use your API call

```
try {
    const { response, cancel } = getIp()
    const { ip } = await response
    console.log(`My IP is ${ip}`)
} catch (err) {
    console.warn(JSON.stringify(err))
}
```
