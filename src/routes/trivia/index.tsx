import { AudioVisualizer } from "#/components/AudioVisualizer";
import { Button } from "#/components/Button";
import { VolumeSlider } from "#/components/VolumeSlider";
import { Track, tracks } from "#/data/ost";
import { normalizeText } from "#/util/text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import styles from "./index.module.css";
import { match } from "ts-pattern";
import { Background } from "#/components/Background";
import { useAudio } from "#/util/audio";
import NumberFlow from "@number-flow/react";

export const Route = createFileRoute("/trivia/")({
	component: RouteComponent,
});

type LoadState = "none" | "loading" | "done" | "correct" | "give_up" | "results";

function RouteComponent() {
	const [volume, setVolume] = useLocalStorage("volume", 100);
	const [track, setTrack] = useState<Track | null>(null);
	const [loadState, setLoadState] = useState<LoadState>("none");
	const [guess, setGuess] = useState("");
	const [wrong, setWrong] = useState<string[]>([]);
	const [streak, setStreak] = useState(0);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const { analyzer } = useAudio({
		volume,
		track,
		setLoading: loading => {
			setLoadState(prev => {
				if (prev === "correct" || prev === "give_up") return prev;
				return loading ? "loading" : "done";
			});
		},
	});

	const randomize = () => {
		const choices = track === null ? tracks : tracks.filter(x => x !== track);
		const rand = choices[Math.floor(Math.random() * choices.length)];
		setLoadState("loading");
		setTrack(rand);
		setGuess("");
		setWrong([]);
	};
	useEffect(() => {
		randomize();
	}, []);

	const submit: React.SubmitEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		if (!track) return;
		if (!guess.trim()) return;
		if (track.matches(guess, normalizeText(guess))) {
			setLoadState("correct");
			setStreak(streak + 1);
		} else {
			setWrong(x => x.concat(guess.trim()));
			setGuess("");
			if (wrong.length + 1 >= 3) {
				setLoadState("give_up");
			}
			inputRef.current?.focus();
		}
	};
	const giveUp = () => {
		setLoadState("give_up");
	};
	const goToResults = () => {
		setLoadState("results");
	};
	const body = match(loadState)
		.with("none", () => null)
		.with("loading", () => <h1>Loading</h1>)
		.with("results", () => (
			<div className={styles.results}>
				<h1>Results</h1>
                <p>Final Streak: {streak}</p>
                <p>Lost to: {track!.name}</p>
                <Link to="/"><Button>Back to Title</Button></Link>
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
								"{x}" is incorrect.
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
			<header className={styles.header}>
				<h1>Streak</h1>
				<p>
					Current Streak: <NumberFlow value={streak} />
				</p>
			</header>
			{analyzer && (
				<AudioVisualizer
					analyzer={analyzer}
					color={match(loadState)
						.with("correct", () => "#00ff00")
						.with("done", () => "#ff00ff")
						.with("give_up", () => "#ff0000")
						.otherwise(() => "#888888")}
				/>
			)}
			<Background />
			<div className={styles.container}>{body}</div>
			<VolumeSlider volume={volume} setVolume={setVolume} />
		</div>
	);
}
