export const shuffle = <T>(arr: T[]) => {
	const array = arr.slice(0);
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
	}
	return array;
};
