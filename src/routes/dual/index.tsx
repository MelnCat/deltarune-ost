import { AudioVisualizer } from "#/components/AudioVisualizer";
import { Background, type BackgroundType } from "#/components/Background";
import { Button } from "#/components/Button";
import { GuessForm } from "#/components/GuessForm";
import { QuitButton } from "#/components/QuitButton";
import { Results } from "#/components/Results";
import { ScoreBox } from "#/components/ScoreBox";
import { VolumeSlider } from "#/components/VolumeSlider";
import { tracks as allTracks, type Track } from "#/data/ost";
import { useGame, getVisualizerColor, glowingSnowPath, randomBackgrounds, type LoadState } from "#/util/trivia";
import { shuffle, useHighScore } from "#/util/util";
import NumberFlow from "@number-flow/react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { match } from "ts-pattern";
import styles from "./index.module.css";
import { useInterval, useLocalStorage } from "usehooks-ts";
import { useAudio, preloadAudio } from "#/util/audio";
import { normalizeText } from "#/util/text";

export const Route = createFileRoute("/dual/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useHighScore("dual");
	const [failed, setFailed] = useState(0);

	const [volume, setVolume] = useLocalStorage("volume", 100);
	const [tracks, setTracks] = useState<Track[] | null>(null);
	const [remainingTracks, setRemainingTracks] = useState<Track[] | null>(null);
	const [nextTracks, setNextTracks] = useState<Track[] | null>(null);
	const [loadState, setLoadState] = useState<LoadState>("none");
	const [guess, setGuess] = useState("");
	const [wrong, setWrong] = useState<string[]>([]);
	const [correct, setCorrect] = useState<Track[]>([]);
	const [background, setBackground] = useState<BackgroundType>("battle");
	const inputRef = useRef<HTMLInputElement | null>(null);
	const paths = useMemo(() => tracks?.map(x => x.paths) ?? [], [tracks]);

	const pool = useRef<Track[] | null>(null);

	const getRandomTracks = useCallback(() => {
		if (!pool.current || pool.current.length < 10) {
			pool.current = shuffle(allTracks);
		}
		return [pool.current.pop()!, pool.current.pop()!];
	}, []);

	const audioLoadChange = useCallback((loading: boolean) => {
		setLoadState(prev => {
			if (prev === "correct" || prev === "give_up" || prev === "results") return prev;
			return loading ? "loading" : "done";
		});
	}, []);

	const { analyzer, audioCtx, startTime } = useAudio({
		volume,
		paths: loadState === "results" ? glowingSnowPath : paths,
		setLoading: audioLoadChange,
	});

	const onFinish = () => {
		setScore(score + 1);
		if (score + 1 > highScore) setHighScore(score + 1);
		setLoadState("correct");
	};

	const onCorrect = (track: Track) => {
		setCorrect(correct.concat(track));
	};

	const goToResults = () => {
		setLoadState("results");
		setBackground("snow");
	};

	const randomize = () => {
		setLoadState("loading");
		const newTracks = nextTracks ?? getRandomTracks();
		setTracks(newTracks);
		setRemainingTracks(newTracks);
		setNextTracks(getRandomTracks());
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
		onGiveUp();
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		randomize();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		for (const path of nextTracks?.flatMap(x => x.paths) ?? []) {
			preloadAudio(path);
		}
	}, [nextTracks]);

	const submit: React.SubmitEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		if (!tracks || !remainingTracks) return;
		if (!guess.trim()) return;

		setGuess("");
		for (const track of remainingTracks) {
			if (track.matches(guess, normalizeText(guess))) {
				onCorrect(track);
				const newRemaining = remainingTracks.filter(x => x !== track);
				if (!newRemaining.length) {
					onFinish();
				}
				setRemainingTracks(newRemaining);
				return;
			}
		}

		setWrong(x => x.concat(guess.trim()));
		if (wrong.length + 1 >= enabledWrong) {
			giveUp();
		}
		inputRef.current?.focus();
	};

	const onGiveUp = () => {
		setFailed(failed + 1);
	};
	const onPlayAgain = () => {
		setScore(0);
		setFailed(0);
	};

	const enabledWrong = 3 - failed;

	const body = match(loadState)
		.with("none", () => null)
		.with("loading", () => <h1>Loading</h1>)
		.with("results", () => (
			<Results onPlayAgain={playAgain}>
				<p>Final Score: {score}</p>
				{score === highScore ? <p className={styles.new}>New high score!</p> : null}
			</Results>
		))
		.with("done", "correct", "give_up", () => (
			<>
				{match(loadState)
					.with("done", () => (
						<>
							<h1>Guess the 2 currently playing songs.</h1>
							<p>Enter only one at a time.</p>
						</>
					))
					.with("correct", () => <h1 className={styles.correct}>Correct!</h1>)
					.with("give_up", () => <h1 className={styles.failed}>Incorrect.</h1>)
					.otherwise(() => "")}
				<GuessForm
					guess={guess}
					setGuess={setGuess}
					wrong={wrong}
					loadState={loadState}
					track={tracks} // todo figure out if this will be fine
					onSubmit={submit}
					onGiveUp={giveUp}
					inputRef={inputRef}
					enabledWrong={enabledWrong}
					extraText={correct.map(x => (
						<div className={styles.correct} key={x.name}>
							{x.name} is correct.
						</div>
					))}
					nextAction={
						failed >= 3 ? (
							<Button type="button" onClick={goToResults} autoFocus>
								Go to Results
							</Button>
						) : (
							<Button type="button" onClick={randomize} autoFocus>
								Next
							</Button>
						)
					}
				/>
			</>
		))
		.exhaustive();

	return (
		<div className={styles.content}>
			<header className={`${styles.header} ${styles.sampleHeader}`}>
				<h1>Dual</h1>
				<p data-new={highScore === score || null}>
					Current Score: <NumberFlow value={score} />
				</p>
			</header>
			<ScoreBox isNew={highScore === score}>
				<p>
					High Score: <NumberFlow value={highScore} />
				</p>
			</ScoreBox>
			{analyzer && <AudioVisualizer analyzer={analyzer} color={getVisualizerColor(loadState)} />}
			<div className={styles.container}>{body}</div>
			<VolumeSlider volume={volume} setVolume={setVolume} />
			<QuitButton prompt={"Quit? Your progress will not be saved."} />
			<AnimatePresence>
				<motion.div className={styles.backgroundContainer} key={background} exit={{ opacity: 0 }}>
					<Background type={background} />
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
