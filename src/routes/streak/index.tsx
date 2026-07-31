import { AudioVisualizer } from "#/components/AudioVisualizer";
import { Background, type BackgroundType } from "#/components/Background";
import { Button } from "#/components/Button";
import { VolumeSlider } from "#/components/VolumeSlider";
import { Track, tracks } from "#/data/ost";
import { preloadAudio, useAudio } from "#/util/audio";
import { normalizeText } from "#/util/text";
import NumberFlow from "@number-flow/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";
import { useLocalStorage } from "usehooks-ts";
import glowingSnow from "@/assets/music/tv_results_screen.ogg";
import { AnimatePresence, motion } from "motion/react";
import { QuitButton } from "#/components/QuitButton";
import styles from "./index.module.css";

const glowingSnowPath = [glowingSnow];

export const Route = createFileRoute("/streak/")({
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
	const [streak, setStreak] = useState(0);
	const [losingTrack, setLosingTrack] = useState<Track | null>(null);
	const [background, setBackground] = useState<BackgroundType>("battle");
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [highScore, setHighScore] = useLocalStorage("streakHighScore", 0);

	const { analyzer } = useAudio({
		volume,
		paths: loadState === "results" ? glowingSnowPath : (track?.paths ?? null),
		setLoading: loading => {
			setLoadState(prev => {
				if (prev === "correct" || prev === "give_up" || prev === "results") return prev;
				return loading ? "loading" : "done";
			});
		},
	});

	const getRandomTrack = (current: Track | null = null) => {
		const choices = current === null ? tracks : tracks.filter(x => x !== current);
		return choices[Math.floor(Math.random() * choices.length)];
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
		setStreak(0);
		randomize();
	};
	useEffect(() => {
		randomize();
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
			setStreak(streak + 1);
			if (streak + 1 > highScore) setHighScore(streak + 1);
		} else {
			setWrong(x => x.concat(guess.trim()));
			setGuess("");
			if (wrong.length + 1 >= 3) {
				giveUp();
			}
			inputRef.current?.focus();
		}
	};
	const giveUp = () => {
		setLosingTrack(track);
		setLoadState("give_up");
	};
	const goToResults = () => {
		setLoadState("results");
		setBackground("snow");
	};
	const body = match(loadState)
		.with("none", () => null)
		.with("loading", () => <h1>Loading</h1>)
		.with("results", () => (
			<div className={styles.results}>
				<h1>Results</h1>
				<p>Final Streak: {streak}</p>
				<p>Lost to: {losingTrack?.name ?? "?"}</p>
				{streak === highScore ? <p className={styles.new}>New high score!</p> : null}
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
							{loadState === "give_up" ? (
								<Button type="button" onClick={goToResults} autoFocus>
									Go to Results
								</Button>
							) : loadState === "correct" ? (
								<Button type="button" onClick={randomize} autoFocus>
									Next
								</Button>
							) : null}
						</>
					)}
				</form>
			</>
		))
		.exhaustive();
	return (
		<div className={styles.content}>
			<header className={`${styles.header} ${styles.streakHeader}`}>
				<h1>Streak</h1>
				<p data-new={highScore === streak || null}>
					Current Streak: <NumberFlow value={streak} />
				</p>
			</header>
			<div className={styles.highScore} data-new={highScore === streak || null}>
				<p>
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
			<QuitButton />
			<AnimatePresence>
				<motion.div className={styles.backgroundContainer} key={background} exit={{ opacity: 0 }}>
					<Background type={background} />
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
