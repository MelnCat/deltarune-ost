import { Button } from "#/components/Button";
import { Track } from "#/data/ost";
import { normalizeText } from "#/util/text";
import type { LoadState } from "#/util/trivia";
import type { ReactNode } from "react";
import styles from "./GuessForm.module.css";

export const GuessForm = ({
	guess,
	setGuess,
	wrong,
	loadState,
	track,
	onSubmit,
	onGiveUp,
	nextAction,
	inputRef,
}: {
	guess: string;
	setGuess: (value: string) => void;
	wrong: string[];
	loadState: LoadState;
	track: Track | null;
	onSubmit: React.SubmitEventHandler<HTMLFormElement>;
	onGiveUp: () => void;
	nextAction: ReactNode;
	inputRef: React.RefObject<HTMLInputElement | null>;
}) => {
	return (
		<form className={styles.form} onSubmit={onSubmit}>
			<div className={styles.inputRow}>
				<input
					ref={inputRef}
					autoFocus
					placeholder="Song Name"
					value={guess}
					onChange={e => setGuess(e.target.value)}
					disabled={loadState !== "done"}
				/>
				<Button type="submit" disabled={loadState !== "done"}>
					Submit
				</Button>
			</div>
			<div>
				<Button type="button" onClick={onGiveUp} disabled={loadState !== "done"}>
					Give Up
				</Button>
			</div>
			<div className={styles.xContainer}>
				{[...Array(3)].map((_, i) => (
					<div className={styles.x} data-active={i < wrong.length || null} key={i}>
						{i < wrong.length ? "X" : ""}
					</div>
				))}
			</div>
			<div className={styles.wrong}>
				{wrong.map((x, i) => (
					<div className={styles.wrongText} key={i}>
						{track && track.messageFor(x, normalizeText(x))}
					</div>
				))}
			</div>
			{loadState !== "done" && (
				<>
					<p>Answer: {track?.name}</p>
					{nextAction}
				</>
			)}
		</form>
	);
};
