export const extractCompanyNameFromEmail = (email: string) => {
    let strings = email.split("@")
    let names = strings[1].split(".")
    return names.at(-2)
}
