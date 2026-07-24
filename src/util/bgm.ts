import { createContext, useContext, useEffect } from "react";

export const useBgm = (url: string, volume: number = 1) => {
	const audioEnabled = useContext(AudioEnabledContext);
	useEffect(() => {
		if (!audioEnabled) return;
		const audio = new Audio(url);
		audio.volume = volume;
		audio.loop = true;

		audio.play();

		return () => {
			audio.pause();
			audio.src = "";
		};
	}, [url, audioEnabled]);
};

export const AudioEnabledContext = createContext(false);
