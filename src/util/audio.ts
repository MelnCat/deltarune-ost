import { useEffect, useRef, useState } from "react";
import { LRUCache } from "lru-cache";

const cacheContext = new AudioContext();
const audioCache = new LRUCache<string, AudioBuffer>({
	max: 20,
	ignoreFetchAbort: true,
	allowStaleOnFetchRejection: true,
	noDeleteOnFetchRejection: true,
	async fetchMethod(k) {
		return cacheContext.decodeAudioData(await (await fetch(k)).arrayBuffer());
	},
});

export const preloadAudio = async (path: string) => {
	await audioCache.fetch(path);
};

export const useAudio = ({
	volume,
	paths,
	setLoading,
}: {
	volume: number;
	paths: string[] | null;
	setLoading?: (loading: boolean) => void;
}) => {
	const audioCtx = useRef<AudioContext | null>(null);
	const gain = useRef<GainNode | null>(null);

	const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);

	const stop = () => {
		if (audioCtx.current) {
			audioCtx.current.close();
			audioCtx.current = null;
			gain.current = null;
			setAnalyzer(null);
		}
	};

	const playTrack = async (paths: string[]) => {
		stop();
		setLoading?.(true);
		const ctx = (audioCtx.current ??= new AudioContext());
		const analyzerNode = ctx.createAnalyser();
		analyzerNode.fftSize = 2048;
		const buffers = await Promise.all(
			paths.map(async x => {
				const cached = await audioCache.forceFetch(x);
				return cached;
			}),
		);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paths]);

	return {
		stop,
		analyzer,
	};
};
