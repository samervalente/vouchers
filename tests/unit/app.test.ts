
import voucherService from "../../src/services/voucherService";
import voucherDataFactory from "./factories/voucherFactory"
import prisma from "../../src/config/database";


beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE vouchers RESTART IDENTITY`
})

describe("Testes para rota de criação de vouchers", () => {
    it("Cria o voucher corretamente em caso de dados válidos", async () => {
    
        const voucher = await voucherDataFactory()
        const {code, discount} = voucher
        const result = await voucherService.createVoucher(code, discount)
        
        expect(result).toBeInstanceOf(Object)
        expect(result).not.toBeNull()

    })

    it("Não cria o voucher caso o código já exista", async () => {
       try {
        const voucher = await voucherDataFactory()
        const {code, discount} = voucher

      
       await voucherService.createVoucher(code, discount)
       await voucherService.createVoucher(code, discount)

       
       } catch (error) {
        expect(error.message).toBe('Voucher already exist.')
       }

    })
})

describe("Teste para a rota de utilização do voucher", ()  => {
    it("Não aplica desconto em vouchers inexistentes", async () => {
        try {
            const code = "invalidCode"
            const amount = 120
            await voucherService.applyVoucher(code, amount)
   
        } catch (error) {
         expect(error.message).toBe('Voucher does not exist.')
        }
    })

    it("Aplica o disconto corretamente quanto o valor da compra é acima de 100", async () => {
        const amount = 150
        const {code, discount} = await voucherDataFactory()
        await voucherService.createVoucher(code, discount)

        const result = await voucherService.applyVoucher(code, amount)
        const {applied, finalAmount} = result

        const valueWithDiscount = amount - (result.amount*(discount/100))

        expect(applied).toBe(true)
        expect(finalAmount).toBe(valueWithDiscount)
    })

    it("Não aplica desconto em valores abaixo de 100", async () => {
        const amount = 95
        const {code, discount} = await voucherDataFactory()
        await voucherService.createVoucher(code, discount)

        const {applied} = await voucherService.applyVoucher(code, amount)

        expect(applied).toBe(false)
        
    })

    it("Retorna os dados corretamente após aplicar o desconto", async () => {
        const amount = 175
        const {code, discount} = await voucherDataFactory()
        await voucherService.createVoucher(code, discount)

        const result = await voucherService.applyVoucher(code, amount)
        expect(result.applied).toBe(true)
        expect(result.discount).toBe(discount)
        expect(result.amount).toBe(amount)
        expect(result.finalAmount).toBe(result.amount - (result.amount*(discount/100)))
        
    })
})
