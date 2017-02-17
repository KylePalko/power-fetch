# Power Fetch for React Native

```
import call, { METHODS, HEADERS } from './call'

const getIp = () => {
    return call({
        url: 'http://ip.jsontest.com/',
        method: METHODS.GET,
        headers: {
            ...HEADERS.JSON
        }
        timeBeforeTimeout: 2000,
        timeBetweenAttempts: 5000
    }, ({ status, json, resolve, reject }) => {
        console.warn(status)
        switch (status) {
            case 200:
                return resolve(json)
            default:
                return reject('unknown-api-error')
        }
    })
}

try {
    const { response, cancel } = getIp()
    const { ip } = await response
    console.warn(`My IP is ${ip}`)
} catch (err) {
    console.warn(JSON.stringify(err))
}
```