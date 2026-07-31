import { useEffect, useRef, useState } from "react";

export const useAudio = ({ volume, paths, setLoading }: { volume: number; paths: string[] | null; setLoading?: (loading: boolean) => void }) => {
	const audioCtx = useRef<AudioContext | null>(null);
	const gain = useRef<GainNode | null>(null);

	const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);

	const playTrack = async (paths: string[]) => {
		stop();
		setLoading?.(true);
		const ctx = (audioCtx.current ??= new AudioContext());
		const analyzerNode = ctx.createAnalyser();
		analyzerNode.fftSize = 2048;
		const buffers = await Promise.all(paths.map(x => fetch(x).then(x => x.arrayBuffer().then(x => ctx.decodeAudioData(x)))));
		if (audioCtx.current !== ctx) {
			if (ctx.state !== "closed") ctx.close();
			return;
		}
		let currentTime = 0;
		for (const buffer of buffers) {
			const source = audioCtx.current.createBufferSource();
			source.buffer = buffer;
			source.connect(analyzerNode);
			source.start(currentTime);
			if (buffer === buffers.at(-1)) {
				source.loop = true;
			}
			currentTime += buffer.duration;
		}
		gain.current = ctx.createGain();
		gain.current.gain.value = volume / 100;
		analyzerNode.connect(gain.current);
		gain.current.connect(audioCtx.current.destination);
		setAnalyzer(analyzerNode);
		setLoading?.(false);
	};
	const stop = () => {
		if (audioCtx.current) {
			audioCtx.current.close();
			audioCtx.current = null;
			gain.current = null;
			setAnalyzer(null);
		}
	};
	useEffect(() => {
		return () => {
			stop();
		};
	}, []);
	useEffect(() => {
		if (!gain.current) return;
		gain.current.gain.value = volume / 100;
	}, [volume]);
	useEffect(() => {
		if (paths) playTrack(paths);
		else stop();
	}, [paths]);
	return {
		stop,
        analyzer
	};
};
