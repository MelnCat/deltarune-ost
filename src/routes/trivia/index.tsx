import { AudioVisualizer } from "#/components/AudioVisualizer";
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
	const playTrack = async (track: Track) => {
		setLoadState("loading");
		console.log("Created");
		const ctx = (audioCtx.current ??= new AudioContext());
		analyzer.current = ctx.createAnalyser();
		setAnalyzerState(analyzer.current);
		analyzer.current.fftSize = 4096;
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
		}
	};
	const randomize = () => {
		stop();
		const rand = tracks[Math.floor(Math.random() * tracks.length)];
		setTrack(rand);
		setGuess("");
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
		if (normalizeText(track.name) === normalizeText(guess)) {
			setLoadState("correct");
			stop();
		}
	};
	const giveUp = () => {
		setLoadState("give_up");
		stop();
	};
	const body = match(loadState)
		.with("none", () => null)
		.with("loading", () => <h1>Loading</h1>)
		.with("done", () => (
			<>
				<h1>Guess the currently playing song</h1>
				<form onSubmit={submit}>
					<input value={guess} onChange={e => setGuess(e.target.value)} />
					<button type="submit">Submit</button>
					<div>
						<button type="button" onClick={giveUp}>
							Give Up
						</button>
					</div>
				</form>
			</>
		))
		.with("correct", () => (
			<div>
				<h1>Correct!</h1>
				<button type="button" onClick={randomize}>
					Play Again
				</button>
			</div>
		))
		.with("give_up", () => (
			<div>
				<h1>You gave up.</h1>
				<p>Answer: {track?.name}</p>
				<button type="button" onClick={randomize}>
					Play Again
				</button>
			</div>
		))
		.exhaustive();
	return (
		<div className={styles.content}>
			{analyzerState && <AudioVisualizer analyzer={analyzerState} />}
			{body}
			<VolumeSlider volume={volume} setVolume={setVolume} />
		</div>
	);
}
