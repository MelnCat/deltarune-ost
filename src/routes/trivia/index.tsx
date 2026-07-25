import { Track, tracks } from "#/data/ost";
import { normalizeText } from "#/util/text";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/trivia/")({
	component: RouteComponent,
});

function RouteComponent() {
	const audioCtx = useRef<AudioContext | null>(null);
	const [track, setTrack] = useState<Track | null>(null);
	type LoadState = "none" | "loading" | "done" | "correct";
	const [loadState, setLoadState] = useState<LoadState>("none");
	const [guess, setGuess] = useState("");
	const playTrack = async (track: Track) => {
		setLoadState("loading");
        audioCtx.current ??= new AudioContext();
		const buffers = await Promise.all(track.paths.map(x => fetch(x).then(x => x.arrayBuffer().then(x => audioCtx.current!.decodeAudioData(x)))));
		let currentTime = 0;
		for (const buffer of buffers) {
			const source = audioCtx.current.createBufferSource();
			source.buffer = buffer;
			source.connect(audioCtx.current.destination);
			source.start(currentTime);
			currentTime += buffer.duration;
		}
		setLoadState("done");
	};
	const randomize = () => {
        if (audioCtx.current) {
            audioCtx.current.close();
            audioCtx.current = null;
        }
		const rand = tracks[Math.floor(Math.random() * tracks.length)];
		setTrack(rand);
		setGuess("");
	};
	useEffect(() => {
		randomize();
	}, []);
	useEffect(() => {
		if (!track) return;
		playTrack(track);
	}, [track]);
	const submit: React.SubmitEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		if (!track) return;
		if (normalizeText(track.name) === normalizeText(guess)) {
			setLoadState("correct");
		}
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
	return (
		<div>
			<h1>Guess the currently playing song</h1>
			<form onSubmit={submit}>
				<input value={guess} onChange={x => setGuess(x.target.value)} />
				<button type="submit">Submit</button>
			</form>
		</div>
	);
}
