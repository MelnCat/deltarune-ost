import { useEffect, useRef } from "react";
import { useEventListener, useInterval } from "usehooks-ts";
import styles from "./AudioVisualizer.module.css";

const MAX_BRIGHTNESS = 255;
const getAWeightingCorrection = (f: number) => {
	if (f <= 0) return -Infinity;

	const f2 = f ** 2;
	const num = 12194 ** 2 * f ** 4;
	const den = (f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2);

	const Ra = num / den;

	return 20 * Math.log10(Ra) + 2.0;
};
export const AudioVisualizer = ({ analyzer, color }: { analyzer: AnalyserNode; color: string }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const resizeCanvas = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
	};
	useEffect(() => {
		resizeCanvas();
	});
	useEventListener("resize", resizeCanvas);
	useEffect(() => {
		let frame = 0;
		// const render = () => {
		// 	if (!analyzer) return;
		// 	const canvas = canvasRef.current;
		// 	if (!canvas) return;
		// 	const data = new Uint8Array(analyzer.frequencyBinCount);
		// 	analyzer.getByteFrequencyData(data);
		// 	const ctx = canvasRef.current!.getContext("2d")!;
		// 	ctx.fillStyle = "#000000aa";
		// 	ctx.fillRect(0, 0, canvas.width, canvas.height);
		// 	ctx.fillStyle = "#222222";
		// 	const barRange = Math.ceil(data.length / NUM_BARS);
		// 	const barWidth = canvas!.width / NUM_BARS;
		// 	for (let i = 0; i < NUM_BARS; i++) {
		// 		const range = data.slice(i * barRange, (i + 1) * barRange);
		// 		const x = range.reduce((l, c) => l + c, 0) / range.length;
		// 		const brightness = Math.round((x / 255) ** 2 * 255);
		// 		ctx.fillStyle = `${color}${brightness.toString(16).padStart(2, "0")}`;
		// 		const height = x * 3;

		// 		ctx.fillRect(barWidth * i + GAP, canvas.height - height, barWidth - GAP * 2, height);
		// 	}
		// 	frame = requestAnimationFrame(render);
		// };
		const render = () => {
			if (!analyzer) return;
			const canvas = canvasRef.current;
			if (!canvas) return;
			const data = new Uint8Array(analyzer.frequencyBinCount);
			const binCount = analyzer.frequencyBinCount;
			analyzer.getByteFrequencyData(data);
			const ctx = canvasRef.current!.getContext("2d")!;
			// ctx.drawImage(canvas, 0, 10, canvas.width, canvas.height - 10, 0, 0, canvas.width, canvas.height - 10);
			// ctx.fillStyle = "#000000";
			// ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
			ctx.reset();

			const min = 1;
			const max = binCount - 1;
			const barCount = 80;
			const barSize = canvas.width / barCount;

			for (let i = 0; i < barCount; i++) {
				const t = (i / barCount) * 0.5 + 0.4;
				const binPos = min * Math.pow(max / min, t);

				const low = Math.floor(binPos);
				const high = Math.min(low + 1, max);
				const frac = binPos - low;
				const x = data[low] * (1 - frac) + data[high] * frac;

				const sampleRate = analyzer.context.sampleRate;
				const freqHz = (binPos * sampleRate) / analyzer.fftSize;

				const rawCorrection = getAWeightingCorrection(freqHz);
				const correction = Number.isFinite(rawCorrection) ? Math.pow(10, rawCorrection / 20) : 0;
				const v = Math.max(x * correction, x * 0.4);
				const brightness = Math.max(0, Math.min(MAX_BRIGHTNESS, Math.round(MAX_BRIGHTNESS * (v / MAX_BRIGHTNESS) ** 3)));
				ctx.fillStyle = `${color}${brightness.toString(16).padStart(2, "0")}`;
				//ctx.fillRect(i, 0, 1, canvas.height);
				ctx.fillRect(barSize * i, 0, barSize, canvas.height);
			}
			frame = requestAnimationFrame(render);
		};
		render();
		return () => cancelAnimationFrame(frame);
	}, [analyzer, color]);
	return <canvas ref={canvasRef} className={styles.canvas} />;
};
