import { matchTrack } from "#/data/ost";
import { get } from "ts-levenshtein"
export const normalizeText = (text: string) => {
	return text
		.normalize("NFKD")
		.toLowerCase()
		.replaceAll(/\(.+?\)/g, "")
		.replaceAll(/[^a-zA-Z0-9]/g, "");
};
export const normalizeTextBrackets = (text: string) => {
	return text
		.normalize("NFKD")
		.toLowerCase()
		.replaceAll(/[^a-zA-Z0-9]/g, "");
};
export const equalsNormalized = (a: string, b: string) =>
	normalizeText(a) === normalizeText(b) || normalizeTextBrackets(a) === normalizeTextBrackets(b);
export const includesNormalized = (a: string, b: string) =>
	normalizeText(a).includes(normalizeText(b)) || normalizeTextBrackets(a).includes(normalizeTextBrackets(b));

/** This assumes that the input is incorrect. */
export const isTypoNormalized = (correct: string, input: string) => {
	return (
		isTypo(normalizeText(correct), normalizeText(input)) ||
		isTypo(normalizeTextBrackets(correct), normalizeTextBrackets(input))
	);
};

/** This assumes that the input is incorrect. */
export const isTypo = (correct: string, input: string) => {
    if (matchTrack(input)) return false;
    
};
