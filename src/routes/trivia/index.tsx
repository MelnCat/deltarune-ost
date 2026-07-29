import { AudioVisualizer } from "#/components/AudioVisualizer";
import { Button } from "#/components/Button";
import { VolumeSlider } from "#/components/VolumeSlider";
import { Track, tracks } from "#/data/ost";
import { normalizeText } from "#/util/text";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import styles from "./index.module.css";
import { match } from "ts-pattern";

export const Route = createFileRoute("/trivia/")({
	component: RouteComponent,
});

function RouteComponent() {
	const audioCtx = useRef<AudioContext | null>(null);
	const analyzer = useRef<AnalyserNode | null>(null);
	const gain = useRef<GainNode | null>(null);
	const [volume, setVolume] = useLocalStorage("volume", 100);

	const [analyzerState, setAnalyzerState] = useState<AnalyserNode | null>(null);
	const [track, setTrack] = useState<Track | null>(null);
	type LoadState = "none" | "loading" | "done" | "correct" | "give_up";
	const [loadState, setLoadState] = useState<LoadState>("none");
	const [guess, setGuess] = useState("");
	const [wrong, setWrong] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const playTrack = async (track: Track) => {
		setLoadState("loading");
		console.log("Created");
		const ctx = (audioCtx.current ??= new AudioContext());
		analyzer.current = ctx.createAnalyser();
		setAnalyzerState(analyzer.current);
		analyzer.current.fftSize = 2048;
		const buffers = await Promise.all(track.paths.map(x => fetch(x).then(x => x.arrayBuffer().then(x => ctx.decodeAudioData(x)))));
		if (audioCtx.current !== ctx) {
			if (ctx.state !== "closed") ctx.close();
			return;
		}
		let currentTime = 0;
		for (const buffer of buffers) {
			const source = audioCtx.current.createBufferSource();
			source.buffer = buffer;
			source.connect(analyzer.current);
			source.start(currentTime);
			if (buffer === buffers.at(-1)) {
				source.loop = true;
			}
			currentTime += buffer.duration;
		}
		gain.current = ctx.createGain();
		gain.current.gain.value = volume / 100;
		analyzer.current.connect(gain.current);
		gain.current.connect(audioCtx.current.destination);
		setLoadState("done");
	};
	const stop = () => {
		if (audioCtx.current) {
			audioCtx.current.close();
			audioCtx.current = null;
			analyzer.current = null;
			setAnalyzerState(null);
		}
	};
	const randomize = () => {
		stop();
		const rand = tracks[Math.floor(Math.random() * tracks.length)];
		setTrack(rand);
		setGuess("");
		setWrong([]);
		playTrack(rand);
	};
	useEffect(() => {
		randomize();
	}, []);
	useEffect(() => {
		return () => {
			stop();
		};
	}, []);
	useEffect(() => {
		if (!gain.current) return;
		gain.current.gain.value = volume / 100;
	}, [volume]);
	const submit: React.SubmitEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		if (!track) return;
		if (!guess.trim()) return;
		if (track.matches(guess, normalizeText(guess))) {
			setLoadState("correct");
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
	const body = match(loadState)
		.with("none", () => null)
		.with("loading", () => <h1>Loading</h1>)
		.with("done", "correct", "give_up", () => (
			<>
				{match(loadState)
					.with("done", () => <h1>Guess the currently playing song.</h1>)
					.with("correct", () => <h1 className={styles.correct}>Correct!</h1>)
					.with("give_up", () => <h1 className={styles.failed}>You failed.</h1>)
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
							<Button type="button" onClick={randomize} autoFocus>
								Play Again
							</Button>
						</>
					)}
				</form>
			</>
		))
		.exhaustive();
	return (
		<div className={styles.content}>
			{analyzerState && (
				<AudioVisualizer
					analyzer={analyzerState}
					color={match(loadState)
						.with("correct", () => "#00ff00")
						.with("done", () => "#ffffff")
						.with("give_up", () => "#ff0000")
						.otherwise(() => "#888888")}
				/>
			)}
			<div className={styles.container}>{body}</div>
			<VolumeSlider volume={volume} setVolume={setVolume} />
		</div>
	);
}
