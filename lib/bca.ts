import axios from 'axios'
import crypto from 'crypto'
require("dotenv").config()

interface IRequest{
    method: any,
    url: string,
    data?: any
}

export default class BCA {

    /**
     * BCA Client ID
     * BCA APIs is using OAuth 2.0 as the authorization framework.
     * To get the access token, you need to be authorized by client_id and client_secret
     * To generate Client ID go to https://developer.bca.co.id/
     * @private
     */
    private CLIENT_ID: string = process.env.BCA_CLIENT_ID

    /**
     * BCA Client Secret ID this will be pairing with Client ID
     * BCA APIs is using OAuth 2.0 as the authorization framework.
     * To get the access token, you need to be authorized by client_id and client_secret
     * To generate Client Secret ID go to https://developer.bca.co.id/
     * @private
     */
    private CLIENT_SECRET: string = process.env.BCA_CLIENT_SECRET

    /**
     * BCA API Key Secret
     * To generate API Key Secret go to https://developer.bca.co.id/
     * @private
     */
    private API_KEY_SECRET: string = process.env.BCA_API_KEY_SECRET

    /**
     * BCA Public API Key
     * To generate Public API Key go to https://developer.bca.co.id/
     */
    public API_KEY: string = process.env.BCA_API_KEY

    /**
     * Valid BCA Access Token. The value will be assigned
     * when generateToken() is called
     * @private
     */
    private ACCESS_TOKEN: string

    /**
     * BCA Base URL based on ENV Variable
     */
    public baseUrl: string = process.env.NODE_ENV != 'production' ?
        "https://sandbox.bca.co.id" :
        "https://api.klikbca.com:443"

    /**
     * Main Public Function. This function can be called globally
     * will interact with axios instance based on config params
     * @param config - is axios config
     */
    public async service(config: IRequest){
        await this.generateToken()
        const request = this.axiosInstance()
        return request({
            method: config.method,
            url: config.url,
            data: config.data,
        })
    }

    /**
     * Base Axios Instance and Axios Interceptor
     * Before we send the request, interceptor will generate
     * the signature that required by BCA API
     * Read more: https://developer.bca.co.id/documentation/?shell#signature
     * @private
     */
    private axiosInstance() {
        const timeStamp = new Date().toISOString()
        const instance = axios.create({
            timeout: 60000,
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Bearer ${this.ACCESS_TOKEN}`,
                'Content-Type': 'Content-Type: application/json',
                'X-BCA-Key': this.API_KEY,
                'X-BCA-Timestamp': timeStamp,
            }
        });

        // Axios Interceptor generate signature and inject to the headers
        instance.interceptors.request.use(async (config) => {
            const method: string = config.method.toUpperCase()
            const signature = await this.generateSignature(method, config.url, this.ACCESS_TOKEN, config.data, timeStamp)

            const header = config.headers
            config.headers = {
                ...header,
                'X-BCA-Signature': signature // inject signature to the headers
            }
            return config
        })
        return instance
    }

    /**
     * Generate BCA Access Token with grant_type = client_credentials
     * Read more: https://developer.bca.co.id/documentation/?shell#oauth2-0
     */
    public generateToken() {
        const grantType: string = 'grant_type=client_credentials'
        return axios.post(`${this.baseUrl}/api/oauth/token`, grantType,{
            headers: {
                Authorization: `Basic ${this.encodeAuthorization()}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).then((res) => {
            this.ACCESS_TOKEN = res.data.access_token
        }).catch((err) => {
            return err
        })
    }

    /**
     * Generate SHA-256 HMAC Signature
     * This signature will be generated and used for each request
     * Read more: https://developer.bca.co.id/documentation/?shell#signature
     * @param httpMethod - is HTTP Method
     * @param urlPath - is BCA URL Path that we're called
     * @param accessToken - Generated new access token
     * @param body - is request body to be called
     * @param timeStamp - current timestamp
     */
    private async generateSignature(httpMethod: string, urlPath:string, accessToken: string, body: any, timeStamp: string){
        const bodyHash: string = await this.hash(body)
        const stringToSign: any = `${httpMethod}:${urlPath}:${accessToken}:${bodyHash}:${timeStamp}`
        return crypto.createHmac('sha256', this.API_KEY_SECRET).update(stringToSign).digest('hex')
    }

    /**
     * Hash body data into SHA256
     * Hash format Lowercase(HexEncode(SHA-256(RequestBody)))
     * @param data - is request body data
     * @private
     */
    private hash(data): any {
        if (typeof data === 'object') data = JSON.stringify(data)
        return crypto.createHash('sha256').update(data.replace(/\s/g, '')).digest('hex')
    }

    /**
     * Encode Client ID and Client Secret into Base64
     * Authorization Basic base64(client_id:client_secret)
     * Read more: https://developer.bca.co.id/documentation/?shell#oauth2-0
     * @private
     */
    private encodeAuthorization(){
        return Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64')
    }
}