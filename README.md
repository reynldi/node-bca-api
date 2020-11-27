
![BCA Developer Image](https://developer.bca.co.id/components/com_apiportal/assets/imgportal/logobca.png)

# Node BCA API

BCA API with Nodejs &amp; Typescript based on Official Documentation https://developer.bca.co.id/

## How to Install ?
Just clone this repository and plug with your project

## Preparing your API Key
All credentials stored at `.env` files. To get your API Key and other BCA Credentials, you can register at https://developer.bca.co.id/


```
// .env

BCA_CLIENT_ID= YOUR_BCA_CLIENT_ID
BCA_CLIENT_SECRET= YOUR_BCA_CLIENT_SECRET
BCA_API_KEY= YOUR_BCA_API_KEY
BCA_API_KEY_SECRET= YOUR_BCA_API_KEY_SECRET
```

## Sample Usage

```js
import BCA from './bca'

public async main(){
	const bca = new BCA()
	return bca.service({
		method: 'GET',
		url: '/general/rate/forex',
		data: ''
	}).then(res => {
		return res
	}).catch(err => {
		return err
	})
}

```

For other use case please see official documentation:
https://developer.bca.co.id/

## Anything else ?
By default the access token expiration is `3600` ( `expires_in` ). For the efficiency you can store those access token anywhere else like Redis or others.

## Dependency
- Typescript
- Axios
- dotenv