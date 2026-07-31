import { useMemo } from "react";
import styles from "./VolumeSlider.module.css";
import RangeSliderImport from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

const RangeSlider = ((RangeSliderImport as any).default ?? RangeSliderImport) as typeof RangeSliderImport;

export const VolumeSlider = ({ volume, setVolume }: { volume: number; setVolume: (vol: number) => void }) => {
	return (
		<div className={styles.slider}>
			<p className="label">Volume</p>
			<div className={styles.sliderContainer}>
				<RangeSlider
					className={styles.input}
					min={0}
					max={100}
					onInput={x => setVolume(100 - x[0])}
					value={[100 - volume, 100]}
					thumbsDisabled={[false, true]}
					rangeSlideDisabled={true}
					orientation="vertical"
				/>
			</div>
		</div>
	);
};
