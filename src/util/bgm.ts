import { useEffect } from "react";

export const useBgm = (url: string, volume: number = 1) => {
	useEffect(() => {
		const audio = new Audio(url);
		audio.volume = volume;
		audio.loop = true;

		audio.play();

		return () => {
			audio.pause();
			audio.src = "";
		};
	}, [url, volume]);
};
