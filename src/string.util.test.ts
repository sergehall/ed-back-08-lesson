import {extractCompanyNameFromEmail} from './string.util'

describe("GameSmartRepository", () => {
    it("should correct parse company name", async () => {
        const result = extractCompanyNameFromEmail("dimych@it-incubator.com")
        expect(result).toBe('it-incubator')
    })
    it("should correct parse company name for subdomain name", async () => {
        const result = extractCompanyNameFromEmail("dimych@blabla.it-incubator.com")
        expect(result).toBe('it-incubator')
    })
})
