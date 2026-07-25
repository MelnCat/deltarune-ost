export const normalizeText = (text: string) => {
    return text.normalize("NFKD").toLowerCase().replaceAll(/[^a-zA-Z0-9]/g, "");
}