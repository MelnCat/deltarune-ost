import { useEffect, useRef } from "react";
import { useEventListener, useInterval } from "usehooks-ts";
import styles from "./AudioVisualizer.module.css";

export const AudioVisualizer = ({ analyzer }: { analyzer: AnalyserNode }) => {
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
	useInterval(() => {
		if (!analyzer) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const data = new Uint8Array(analyzer.frequencyBinCount);
		analyzer.getByteFrequencyData(data);
		const ctx = canvasRef.current!.getContext("2d")!;
		ctx.fillStyle = "#000000aa";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#222222";
		const barWidth = canvas!.width / data.length;
		for (let i = 0; i < data.length; i++) {
			const x = data[i];
			const brightness = Math.round((x / 255) ** 2 * 255);
			ctx.fillStyle = `#ffffff${brightness.toString(16).padStart(2, "0")}`;
			const height = x * 3;

			ctx.fillRect(barWidth * i, canvas.height - height, barWidth, height);
		}
	}, 50);
	return <canvas ref={canvasRef} className={styles.canvas} />;
};
