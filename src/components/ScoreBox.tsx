import type { ReactNode } from "react";
import styles from "./ScoreBox.module.css";

export const ScoreBox = ({ isNew, children }: { isNew: boolean; children: ReactNode }) => {
	return (
		<div className={styles.scoreBox} data-new={isNew || null}>
			{children}
		</div>
	);
};