import { AudioVisualizer } from "#/components/AudioVisualizer";
import { Background, type BackgroundType } from "#/components/Background";
import { Button } from "#/components/Button";
import { GuessForm } from "#/components/GuessForm";
import { QuitButton } from "#/components/QuitButton";
import { Results } from "#/components/Results";
import { VolumeSlider } from "#/components/VolumeSlider";
import { Track, tracks, tracksByName } from "#/data/ost";
import { preloadAudio, useAudio } from "#/util/audio";
import { normalizeText } from "#/util/text";
import { glowingSnowPath, randomBackgrounds, getVisualizerColor, type LoadState } from "#/util/trivia";
import { shuffle, useGauntletResults } from "#/util/util";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import prettyMs from "pretty-ms";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { match } from "ts-pattern";
import { useLocalStorage } from "usehooks-ts";
import styles from "./index.module.css";

export const Route = createFileRoute("/gauntlet/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [volume, setVolume] = useLocalStorage("volume", 100);
	const [results, setResults] = useGauntletResults();
	const [startTime, setStartTime] = useLocalStorage<number>("gauntletStartTime", 0);
	const [endTime, setEndTime] = useLocalStorage<number>("gauntletEndTime", 0);
	const [queue, setQueue] = useLocalStorage<string[] | null>("gauntletQueue", null);
	const [track, setTrack] = useState<Track | null>(null);
	const [loadState, setLoadState] = useState<LoadState>("none");
	const [guess, setGuess] = useState("");
	const [background, setBackground] = useState<BackgroundType>("battle");
	const [wrong, setWrong] = useLocalStorage<string[]>("gauntletWrong", []);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const worstChapter = useMemo(() => {
		if (!results || !queue) return "";
		if (results.length !== queue.length) return "";
		const wrongAlbums = results
			.map((x, i) => ({ x, i }))
			.filter(x => !x.x.correct)
			.map(x => tracksByName[queue[x.i]])
			.flatMap(x => x.album);
		const grouped = wrongAlbums.reduce(
			(l, c) => {
				l[c] ??= 0;
				l[c]++;
				return l;
			},
			{} as Record<string, number>,
		);
		return Object.entries(grouped).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None! I got everything correct!";
	}, [results, queue]);
	const shareData = useMemo(() => {
		if (!results || !queue) return "";
		return `\
I managed to guess ${results.filter(x => x.correct).length}/${queue.length} (${((results.filter(x => x.correct).length / queue.length) * 100).toFixed(2)}%) of all DELTARUNE songs correctly!
My most forgotten chapter OST: \`${worstChapter}\`
https://deltaruneost.crab.trade/gauntlet`;
	}, [results, queue, worstChapter]);

	const audioLoadChange = useCallback((loading: boolean) => {
		setLoadState(prev => {
			if (prev === "correct" || prev === "give_up" || prev === "results") return prev;
			return loading ? "loading" : "done";
		});
	}, []);

	const { analyzer } = useAudio({
		volume,
		paths: loadState === "results" ? glowingSnowPath : (track?.paths ?? null),
		setLoading: audioLoadChange,
	});

	const share = () => {
		if (navigator.share) {
			navigator.share({
				text: shareData,
			});
		} else {
			navigator.clipboard.writeText(shareData);
			alert("Copied to clipboard!");
		}
	};

	const giveUp = useCallback(
		(wrong: number) => {
			setResults(results!.concat({ guesses: wrong, correct: false }));
			setLoadState("give_up");
		},
		[results, setResults],
	);

	const goToResults = () => {
		setLoadState("results");
		setBackground("snow");
		if (endTime === 0) {
			setEndTime(Date.now());
		}
	};

	const queueNext = (results: { guesses: number; correct: boolean }[], queue: string[]) => {
		if (results.length === queue.length) {
			goToResults();
		} else {
			setLoadState("loading");
			const next = queue[results.length];
			setTrack(tracksByName[next]);
			setGuess("");
			setWrong([]);
			setBackground(randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)]);
			const after = queue[results.length + 1];
			if (after) {
				const toPreload = tracksByName[after].paths;
				for (const path of toPreload) {
					preloadAudio(path);
				}
			}
		}
	};
	const restart = () => {
		setWrong([]);
		setResults([]);
		setStartTime(Date.now());
		setEndTime(0);
		const q = shuffle(tracks.map(x => x.name));
		setQueue(q);
		queueNext([], q);
	};

	const promptReset = () => {
		if (!confirm("Really reset all your progress? This will require you to do the gauntlet from the beginning again.")) return;
		if ((results?.length ?? 0) > 50) {
			if (!confirm("Are you really REALLY sure? You will really discard all of your current progress?")) return;
		}
		restart();
	};

	useEffect(() => {
		if (!queue || !results) return;
		const missing = tracks.filter(x => !queue.includes(x.name));
		if (!missing.length) return;
		const unanswered = queue.slice(results.length);
		const shuffled = shuffle([...unanswered, ...missing.map(x => x.name)]);
		setQueue([...queue.slice(0, results.length), ...shuffled]);
	}, [queue, results, setQueue]);

	useEffect(() => {
		if (!results || !queue) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			restart();
		} else {
			queueNext(results, queue);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const submit: React.SubmitEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		if (!track) return;
		if (!guess.trim()) return;
		if (track.matches(guess, normalizeText(guess))) {
			setLoadState("correct");
			setResults(results!.concat({ guesses: wrong.length + 1, correct: true }));
		} else {
			setWrong(x => x.concat(guess.trim()));
			setGuess("");
			if (wrong.length + 1 >= 3) {
				giveUp(wrong.length + 1);
			}
			inputRef.current?.focus();
		}
	};

	const manualGiveUp = useCallback(() => giveUp(wrong.length), [giveUp, wrong.length]);
	const body = match(loadState)
		.with("none", () => null)
		.with("loading", () => <h1>Loading</h1>)
		.with("results", () => (
			<Results
				onPlayAgain={promptReset}
				extraButtons={
					<Button autoFocus onClick={share}>
						Share Results
					</Button>
				}
			>
				<p>
					Tracks Guessed Correctly: {results!.filter(x => x.correct).length}/{results!.length} (
					{((results!.filter(x => x.correct).length / results!.length) * 100).toFixed(2)}%)
				</p>
				<p>Average # of Guesses: {+(results!.reduce((l, c) => l + c.guesses, 0) / results!.length).toFixed(2)}</p>
				<p>
					Total Wrong Guesses:{" "}
					{
						+results!
							.map(x => (x.correct ? x.guesses - 1 : x.guesses))
							.reduce((l, c) => l + c, 0)
							.toFixed(2)
					}
				</p>
				<p>Total Time Spent: {prettyMs(endTime - startTime)}</p>
				<p>Most Forgotten OST: {worstChapter}</p>
			</Results>
		))
		.with("done", "correct", "give_up", () => (
			<>
				{match(loadState)
					.with("done", () => <h1>Guess the currently playing song.</h1>)
					.with("correct", () => <h1 className={styles.correct}>Correct!</h1>)
					.with("give_up", () => <h1 className={styles.failed}>Better luck next time.</h1>)
					.otherwise(() => "")}
				<GuessForm
					guess={guess}
					setGuess={setGuess}
					wrong={wrong}
					loadState={loadState}
					track={track}
					onSubmit={submit}
					onGiveUp={manualGiveUp}
					inputRef={inputRef}
					nextAction={
						<Button type="button" onClick={() => queueNext(results!, queue!)} autoFocus>
							Next
						</Button>
					}
				/>
			</>
		))
		.exhaustive();
	return (
		<div className={styles.content}>
			<header className={`${styles.header} ${styles.gauntletHeader}`}>
				<h1>Full OST Gauntlet</h1>
				<p>
					Completed: {results?.length ?? 0}/{queue?.length ?? 0}
				</p>
				<p className={styles.correct}>
					Correct: {results?.filter(x => x.correct)?.length ?? 0}/{results?.length ?? 0}
					<span className={styles.gray}>
						{" "}
						({(((results?.filter(x => x.correct)?.length ?? 0) / (results?.length || 1)) * 100).toFixed(1)}%)
					</span>
				</p>
			</header>
			{analyzer && <AudioVisualizer analyzer={analyzer} color={getVisualizerColor(loadState)} />}
			<div className={styles.container}>{body}</div>
			<VolumeSlider volume={volume} setVolume={setVolume} />
			<QuitButton prompt={"Quit? Progress WILL be saved."} />
			<Button className={styles.resetButton} onClick={promptReset}>
				Reset
			</Button>
			<AnimatePresence>
				<motion.div className={styles.backgroundContainer} key={background} exit={{ opacity: 0 }}>
					<Background type={background} />
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
