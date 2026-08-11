import { matchTrack } from "#/data/ost";
import * as levenshtein from "fastest-levenshtein";
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
	return isTypo(normalizeText(correct), normalizeText(input)) || isTypo(normalizeTextBrackets(correct), normalizeTextBrackets(input));
};

 const isTypo = (correct: string, input: string) => {
	if (matchTrack(input)) return false;
	if (levenshtein.distance(correct, input) <= 1) return true;
	if (isAnagram(correct, input)) return true;
    if (correct.length === input.length && [...correct].every((x, i) => x === input[i] || (x in keyNeighbors && keyNeighbors[x].includes(input[i])))) return true;
    return false;
};

const isAnagram = (a: string, b: string) => {
	if (a.length !== b.length) return false;
	const freq: Record<string, number> = {};
	for (const c of a) {
		freq[c] ??= 0;
		freq[c]++;
	}
	for (const c of b) {
		if (!freq[c]) return false;
		freq[c]--;
	}
	return Object.values(freq).every(x => x === 0);
};

const keyNeighbors: Record<string, string[]> = {
	"1": ["2", "q"],
	"2": ["1", "3", "q", "w"],
	"3": ["2", "4", "w", "e"],
	"4": ["3", "5", "e", "r"],
	"5": ["4", "6", "r", "t"],
	"6": ["5", "7", "t", "y"],
	"7": ["6", "8", "y", "u"],
	"8": ["7", "9", "u", "i"],
	"9": ["8", "0", "i", "o"],
	"0": ["9", "o", "p"],

	q: ["1", "2", "w", "a"],
	w: ["2", "3", "q", "e", "a", "s"],
	e: ["3", "4", "w", "r", "s", "d"],
	r: ["4", "5", "e", "t", "d", "f"],
	t: ["5", "6", "r", "y", "f", "g"],
	y: ["6", "7", "t", "u", "g", "h"],
	u: ["7", "8", "y", "i", "h", "j"],
	i: ["8", "9", "u", "o", "j", "k"],
	o: ["9", "0", "i", "p", "k", "l"],
	p: ["0", "o", "l"],

	a: ["q", "w", "s", "z"],
	s: ["w", "e", "a", "d", "z", "x"],
	d: ["e", "r", "s", "f", "x", "c"],
	f: ["r", "t", "d", "g", "c", "v"],
	g: ["t", "y", "f", "h", "v", "b"],
	h: ["y", "u", "g", "j", "b", "n"],
	j: ["u", "i", "h", "k", "n", "m"],
	k: ["i", "o", "j", "l", "m"],
	l: ["o", "p", "k"],

	z: ["a", "s", "x"],
	x: ["s", "d", "z", "c"],
	c: ["d", "f", "x", "v"],
	v: ["f", "g", "c", "b"],
	b: ["g", "h", "v", "n"],
	n: ["h", "j", "b", "m"],
	m: ["j", "k", "n"],
};
