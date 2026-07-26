import { Track, tracks } from "#/data/ost";
import { normalizeText } from "#/util/text";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useInterval } from "usehooks-ts";
import styles from "./index.module.css";

export const Route = createFileRoute("/trivia/")({
	component: RouteComponent,
});

function RouteComponent() {
	const audioCtx = useRef<AudioContext | null>(null);
	const [track, setTrack] = useState<Track | null>(null);
	type LoadState = "none" | "loading" | "done" | "correct" | "give_up";
	const [loadState, setLoadState] = useState<LoadState>("none");
	const [guess, setGuess] = useState("");
	const analyzer = useRef<AnalyserNode | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const playTrack = async (track: Track) => {
		setLoadState("loading");
		console.log("Created");
		const ctx = (audioCtx.current ??= new AudioContext());
		analyzer.current = ctx.createAnalyser();
		analyzer.current.fftSize = 4096;
		const buffers = await Promise.all(
			track.paths.map(x => fetch(x).then(x => x.arrayBuffer().then(x => ctx.decodeAudioData(x)))),
		);
		if (audioCtx.current !== ctx) {
			ctx.close();
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
		analyzer.current.connect(audioCtx.current.destination);
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
		if (canvasRef.current) {
			canvasRef.current.width = canvasRef.current.clientWidth;
			canvasRef.current.height = canvasRef.current.clientHeight;
		}
	}, [loadState]);
	useEffect(() => {
		return () => {
			stop();
		};
	}, []);
	useInterval(() => {
		if (!analyzer.current) return;
		if (!canvasRef.current) return;
		const data = new Uint8Array(analyzer.current.frequencyBinCount);
		analyzer.current.getByteFrequencyData(data);
		const ctx = canvasRef.current!.getContext("2d")!;
		ctx.fillStyle = "#000000aa";
		ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
		ctx.fillStyle = "#222222";
		const barWidth = canvasRef.current!.width / data.length;
		for (let i = 0; i < data.length; i++) {
			const x = data[i];
			const brightness = Math.round((x / 255) ** 2 * 255);
			ctx.fillStyle = `#ffffff${brightness.toString(16).padStart(2, "0")}`;
			const height =x*3;

			ctx.fillRect(barWidth * i, canvasRef.current.height - height, barWidth, height);
		}
	}, 50);
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
	if (loadState === "none") {
		return (
			<div>
				<h1></h1>
			</div>
		);
	}
	if (loadState === "loading") {
		return (
			<div>
				<h1>Loading</h1>
			</div>
		);
	}
	if (loadState === "correct") {
		return (
			<div>
				<h1>Correct!</h1>
				<button onClick={randomize}>Play Again</button>
			</div>
		);
	}
	if (loadState === "give_up") {
		return (
			<div>
				<h1>You gave up.</h1>
				<p>Answer: {track!.name}</p>
				<button onClick={randomize}>Play Again</button>
			</div>
		);
	}
	return (
		<div>
			<h1>Guess the currently playing song</h1>
			<canvas ref={canvasRef} className={styles.canvas} />
			<form onSubmit={submit}>
				<input value={guess} onChange={x => setGuess(x.target.value)} />
				<button type="submit">Submit</button>
				<div>
					<button onClick={giveUp}>Give Up</button>
				</div>
			</form>
		</div>
	);
}
