import BCA from './bca'

export default class ForexRate {

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
}