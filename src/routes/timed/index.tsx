import { AudioVisualizer } from "#/components/AudioVisualizer";
import { Background, type BackgroundType } from "#/components/Background";
import { Button } from "#/components/Button";
import { VolumeSlider } from "#/components/VolumeSlider";
import { Track, tracks } from "#/data/ost";
import { preloadAudio, useAudio } from "#/util/audio";
import { normalizeText } from "#/util/text";
import NumberFlow from "@number-flow/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";
import { useInterval, useLocalStorage } from "usehooks-ts";
import glowingSnow from "@/assets/music/tv_results_screen.ogg";
import { AnimatePresence, motion } from "motion/react";
import { QuitButton } from "#/components/QuitButton";
import styles from "./index.module.css";
import prettyMs from "pretty-ms";
import { shuffle, useHighScore } from "#/util/util";
const glowingSnowPath = [glowingSnow];

export const Route = createFileRoute("/timed/")({
	component: RouteComponent,
});

type LoadState = "none" | "loading" | "done" | "correct" | "give_up" | "results";

const randomBackgrounds: BackgroundType[] = ["battle"];

function RouteComponent() {
	const [volume, setVolume] = useLocalStorage("volume", 100);
	const [track, setTrack] = useState<Track | null>(null);
	const [nextTrack, setNextTrack] = useState<Track | null>(null);
	const [loadState, setLoadState] = useState<LoadState>("none");
	const [guess, setGuess] = useState("");
	const [wrong, setWrong] = useState<string[]>([]);
	const [score, setScore] = useState(0);
	const [background, setBackground] = useState<BackgroundType>("battle");
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [highScore, setHighScore] = useHighScore("timed");
	const [timeLeft, setTimeLeft] = useState(30000);
	const pool = useRef<Track[] | null>(null);

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

	const giveUp = () => {
		setLoadState("give_up");
		setTimeLeft(timeLeft - 1000);
	};
	const goToResults = () => {
		setLoadState("results");
		setBackground("snow");
	};

	const getRandomTrack = (current: Track | null = null) => {
		if (!pool.current || pool.current.length <= 10) {
			pool.current = shuffle(tracks);
		}
		return pool.current.pop() ?? tracks[Math.floor(Math.random() * tracks.length)];
		// const choices = current === null ? tracks : tracks.filter(x => x !== current);
		// return choices[Math.floor(Math.random() * choices.length)];
	};

	const randomize = () => {
		setLoadState("loading");
		const newTrack = nextTrack ?? getRandomTrack(track);
		setTrack(newTrack);
		setNextTrack(getRandomTrack(newTrack));
		setGuess("");
		setWrong([]);
		setBackground(randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)]);
	};
	const playAgain = () => {
		setWrong([]);
		setScore(0);
		setTimeLeft(30000);
		randomize();
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

	useInterval(() => {
		if (timeLeft <= 0) {
			goToResults();
		} else if (loadState !== "loading" && loadState !== "none") {
			setTimeLeft(Math.max(0, timeLeft - 50));
		}
	}, 50);

	const submit: React.SubmitEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		if (!track) return;
		if (!guess.trim()) return;
		if (track.matches(guess, normalizeText(guess))) {
			setLoadState("correct");
			setScore(score + 1);
			if (score + 1 > highScore) setHighScore(score + 1);
			setTimeLeft(Math.min(30000, timeLeft + 5000));
		} else {
			setWrong(x => x.concat(guess.trim()));
			setGuess("");
			if (wrong.length + 1 >= 3) {
				giveUp();
			}
			inputRef.current?.focus();
		}
	};
	const body = match(loadState)
		.with("none", () => null)
		.with("loading", () => <h1>Loading</h1>)
		.with("results", () => (
			<div className={styles.results}>
				<h1>Results</h1>
				<p>Final Score: {score}</p>
				{score === highScore ? <p className={styles.new}>New high score!</p> : null}
				<div className={styles.buttonRow}>
					<Button autoFocus onClick={playAgain}>
						Play Again
					</Button>
					<Link to="/">
						<Button>Back to Title</Button>
					</Link>
				</div>
			</div>
		))
		.with("done", "correct", "give_up", () => (
			<>
				{match(loadState)
					.with("done", () => <h1>Guess the currently playing song.</h1>)
					.with("correct", () => <h1 className={styles.correct}>Correct!</h1>)
					.with("give_up", () => <h1 className={styles.failed}>Streak ended.</h1>)
					.otherwise(() => "")}
				<form className={styles.form} onSubmit={submit}>
					<div className={styles.inputRow}>
						<input
							ref={inputRef}
							autoFocus
							placeholder="Song Name"
							value={guess}
							onChange={e => setGuess(e.target.value)}
							disabled={loadState !== "done"}
						/>
						<Button type="submit" disabled={loadState !== "done"}>
							Submit
						</Button>
					</div>
					<div>
						<Button type="button" onClick={giveUp} disabled={loadState !== "done"}>
							Give Up
						</Button>
					</div>
					<div className={styles.xContainer}>
						{[...Array(3)].map((_, i) => (
							<div className={styles.x} data-active={i < wrong.length || null} key={i}>
								{i < wrong.length ? "X" : ""}
							</div>
						))}
					</div>
					<div className={styles.wrong}>
						{wrong.map((x, i) => (
							<div className={styles.wrongText} key={i}>
								{track && track.messageFor(x, normalizeText(x))}
							</div>
						))}
					</div>
					{loadState !== "done" && (
						<>
							<p>Answer: {track?.name}</p>
							<Button type="button" onClick={randomize} autoFocus>
								Next
							</Button>
						</>
					)}
				</form>
			</>
		))
		.exhaustive();
	return (
		<div className={styles.content}>
			<header className={`${styles.header}`}>
				<h1>Timed</h1>
				<p>
					Time Left:{" "}
					<span className={styles.time}>
						{timeLeft > 0 ? prettyMs(timeLeft, { keepDecimalsOnWholeSeconds: true, subSecondsAsDecimals: true }) : "Game over!"}
					</span>
				</p>
			</header>
			<div className={styles.score}>
				<p>
					Score: <NumberFlow value={score} />
				</p>
				<p data-new={highScore === score || null}>
					High Score: <NumberFlow value={highScore} />
				</p>
			</div>
			{analyzer && (
				<AudioVisualizer
					analyzer={analyzer}
					color={match(loadState)
						.with("correct", () => "#00ff00")
						.with("done", () => "#ff00ff")
						.with("give_up", () => "#ff0000")
						.otherwise(() => "#ffffff")}
				/>
			)}
			<div className={styles.container}>{body}</div>
			<VolumeSlider volume={volume} setVolume={setVolume} />
			<QuitButton extraBottomSpace />
			<AnimatePresence>
				<motion.div className={styles.backgroundContainer} key={background} exit={{ opacity: 0 }}>
					<Background type={background} />
				</motion.div>
			</AnimatePresence>
			{loadState !== "results" && (
				<>
					<motion.div className={styles.timeOverlay} animate={{ "--t": Math.max(0, timeLeft / 30000) }}></motion.div>
					<motion.div
						className={`${styles.timeOverlay} ${styles.color}`}
						animate={{ "--t": Math.max(0, timeLeft / 30000) }}
					></motion.div>
				</>
			)}
		</div>
	);
}
