import type { BackgroundType } from "#/components/Background";
import { Track, tracks } from "#/data/ost";
import { preloadAudio, useAudio } from "#/util/audio";
import { normalizeText } from "#/util/text";
import { shuffle } from "#/util/util";
import glowingSnow from "@/assets/music/tv_results_screen.ogg";
import { useCallback, useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";
import { useLocalStorage } from "usehooks-ts";

export type LoadState = "none" | "loading" | "done" | "correct" | "give_up" | "results";

export const glowingSnowPath = [glowingSnow];

export const randomBackgrounds: BackgroundType[] = ["battle"];

export const getVisualizerColor = (loadState: LoadState) =>
	match(loadState)
		.with("correct", () => "#00ff00")
		.with("done", () => "#ff00ff")
		.with("give_up", () => "#ff0000")
		.otherwise(() => "#ffffff");

export const useGame = ({
	onCorrect,
	onGiveUp,
	onPlayAgain,
	maxWrong = 3,
	enabledWrong = maxWrong,
	samples = false,
}: {
	onCorrect: (guesses: number) => void;
	onGiveUp: (track: Track | null) => void;
	onPlayAgain: () => void;
	maxWrong?: number;
	enabledWrong?: number;
	samples?: boolean;
}) => {
	const [volume, setVolume] = useLocalStorage("volume", 100);
	const [track, setTrack] = useState<Track | null>(null);
	const [nextTrack, setNextTrack] = useState<Track | null>(null);
	const [loadState, setLoadState] = useState<LoadState>("none");
	const [guess, setGuess] = useState("");
	const [wrong, setWrong] = useState<string[]>([]);
	const [background, setBackground] = useState<BackgroundType>("battle");
	const inputRef = useRef<HTMLInputElement | null>(null);

	const pool = useRef<Track[] | null>(null);
	const getRandomTrack = useCallback(() => {
		if (!pool.current || pool.current.length <= 10) {
			pool.current = shuffle(tracks);
		}
		return pool.current.pop() ?? tracks[Math.floor(Math.random() * tracks.length)];
	}, []);

	const audioLoadChange = useCallback((loading: boolean) => {
		setLoadState(prev => {
			if (prev === "correct" || prev === "give_up" || prev === "results") return prev;
			return loading ? "loading" : "done";
		});
	}, []);

	const { analyzer, audioCtx, startTime } = useAudio({
		volume,
		paths: loadState === "results" ? glowingSnowPath : (track?.paths ?? null),
		setLoading: audioLoadChange,
		samples: loadState !== "results" && samples,
	});

	const goToResults = () => {
		setLoadState("results");
		setBackground("snow");
	};

	const randomize = () => {
		setLoadState("loading");
		const newTrack = nextTrack ?? getRandomTrack();
		setTrack(newTrack);
		setNextTrack(getRandomTrack());
		setGuess("");
		setWrong([]);
		setBackground(randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)]);
	};

	const playAgain = () => {
		setWrong([]);
		onPlayAgain();
		randomize();
	};

	const giveUp = () => {
		setLoadState("give_up");
		onGiveUp(track);
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		randomize();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		for (const path of nextTrack?.paths ?? []) {
			preloadAudio(path);
		}
	}, [nextTrack]);

	const submit: React.SubmitEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		if (!track) return;
		if (!guess.trim()) return;
		if (track.matches(guess, normalizeText(guess))) {
			setLoadState("correct");
			onCorrect(wrong.length + 1);
		} else {
			setWrong(x => x.concat(guess.trim()));
			setGuess("");
			console.log(enabledWrong);
			if (wrong.length + 1 >= enabledWrong) {
				giveUp();
			}
			inputRef.current?.focus();
		}
	};

	return {
		volume,
		setVolume,
		track,
		nextTrack,
		loadState,
		guess,
		setGuess,
		wrong,
		background,
		inputRef,
		analyzer,
		randomize,
		playAgain,
		goToResults,
		giveUp,
		submit,
		maxWrong,
		enabledWrong,
		audioCtx,
		audioStartTime: startTime,
	};
};
