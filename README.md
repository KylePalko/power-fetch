# Power Fetch for React Native

Power Fetch is built on XMLHttpRequest to allow true cancel/abort of your connection.

### 1. Create a function to abstract your API call

```
import fetch, { METHODS, HEADERS } from 'power-fetch'

const getIp = () => {
    return call({
        url: 'http://ip.jsontest.com/',
        method: METHODS.GET,
        headers: {
            ...HEADERS.JSON
        }
        numberOfAttempts: 5,
        timeBeforeTimeout: 2000,
        timeBetweenAttempts: 5000
    }, ({ headers, status, json, resolve, reject }) => {
        switch (status) {
            case 200:
                return resolve(json)
            default:
                return reject('unknown-api-error')
        }
    })
}
```

### 2. Use your API call

```
try {
    const { response, cancel } = getIp()
    const { ip } = await response
    console.log(`My IP is ${ip}`)
} catch (err) {
    console.warn(JSON.stringify(err))
}
```