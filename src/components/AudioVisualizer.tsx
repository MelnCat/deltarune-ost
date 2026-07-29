import { useEffect, useRef } from "react";
import { useEventListener, useInterval } from "usehooks-ts";
import styles from "./AudioVisualizer.module.css";

const NUM_BARS = 40;
const GAP = 5;

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
		const render = () => {
			if (!analyzer) return;
			const canvas = canvasRef.current;
			if (!canvas) return;
			const data = new Uint8Array(analyzer.frequencyBinCount);
			analyzer.getByteFrequencyData(data);
			const ctx = canvasRef.current!.getContext("2d")!;
			ctx.fillStyle = "#000000aa";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = "#222222";
			const barRange = Math.ceil(data.length / NUM_BARS);
			const barWidth = canvas!.width / NUM_BARS;
			for (let i = 0; i < NUM_BARS; i++) {
				const range = data.slice(i * barRange, (i + 1) * barRange);
				const x = range.reduce((l, c) => l + c, 0) / range.length;
				const brightness = Math.round((x / 255) ** 2 * 255);
				ctx.fillStyle = `${color}${brightness.toString(16).padStart(2, "0")}`;
				const height = x * 3;

				ctx.fillRect(barWidth * i + GAP, canvas.height - height, barWidth - GAP * 2, height);
			}
			frame = requestAnimationFrame(render);
		};
		render();
		return () => cancelAnimationFrame(frame);
	}, [analyzer, color]);
	return <canvas ref={canvasRef} className={styles.canvas} />;
};
