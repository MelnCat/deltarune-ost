import styles from "./VolumeSlider.module.css";

export const VolumeSlider = ({ volume, setVolume }: { volume: number; setVolume: (vol: number) => void }) => {
	return (
		<div className={styles.slider}>
			<p className="label">Volume</p>
			<input type="range" min="0" max="100" value={volume} onChange={x => setVolume(x.target.valueAsNumber)} />
		</div>
	);
};
