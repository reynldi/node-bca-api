import axios from 'axios'
import BCAService from '../lib/bca'
import ForexRate from "../lib/forexRate";

const BCA = new BCAService()

it('Should generate new access token', async () => {
    const token = await BCA.generateToken()
    expect(token).toBeDefined()
})

it('Should get forex rate information', async () =>{
    const getForex = new ForexRate().main()

    const res = await getForex.then(result => {
        return result
    }).catch(error => {
        return error
    })

    expect(res.status).toBe(200)
    expect(res.data.Currencies).toBeDefined()
})


