import { useLocalStorage } from "usehooks-ts";

export const shuffle = <T>(arr: T[]) => {
	const array = arr.slice(0);
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};

export interface GauntletResult {
	guesses: number;
	correct: boolean;
}

export const useGauntletResults = () => {
	return useLocalStorage<GauntletResult[] | null>("gauntletResults", null);
};

export const useHighScore = (key: string) => {
	return useLocalStorage(`${key}HighScore`, 0);
};
