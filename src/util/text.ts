export const normalizeText = (text: string) => {
    return text.normalize("NFKD").toLowerCase().replaceAll(/\(.+?\)/g, "").replaceAll(/[^a-zA-Z0-9]/g, "");
}