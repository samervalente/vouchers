import {Voucher} from "@prisma/client"
import {faker} from "@faker-js/faker"

type VoucherDataType = Omit<Voucher, "id">

export default async function voucharDataFactory(){
    const voucher: VoucherDataType = {
        code:faker.random.alphaNumeric(6),
        discount:Math.floor(Math.random()*100),
        used:faker.datatype.boolean()
    }

    return voucher
}