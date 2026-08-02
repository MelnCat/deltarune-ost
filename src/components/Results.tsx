import { Button } from "#/components/Button";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import styles from "./Results.module.css";

export const Results = ({ children, onPlayAgain, extraButtons }: { children: ReactNode; onPlayAgain: () => void; extraButtons?: ReactNode }) => {
	return (
		<div className={styles.results}>
			<h1>Results</h1>
			{children}
			<div className={styles.buttonRow}>
                {extraButtons}
				<Button autoFocus onClick={onPlayAgain}>
					Play Again
				</Button>
				<Link to="/">
					<Button>Back to Title</Button>
				</Link>
			</div>
		</div>
	);
};