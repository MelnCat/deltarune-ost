export const normalizeText = (text: string) => {
    return text.normalize("NFKD").toLowerCase().replaceAll(/\W/g, "");
}