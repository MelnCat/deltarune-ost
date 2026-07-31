export const normalizeText = (text: string) => {
	return text
		.normalize("NFKD")
		.toLowerCase()
		.replaceAll(/\(.+?\)/g, "")
		.replaceAll(/[^a-zA-Z0-9]/g, "");
};
export const equalsNormalized = (a: string, b: string) => normalizeText(a) === normalizeText(b);
export const includesNormalized = (a: string, b: string) => normalizeText(a).includes(normalizeText(b))