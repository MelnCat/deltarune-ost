import { AudioVisualizer } from "#/components/AudioVisualizer";
import { Background } from "#/components/Background";
import { Button } from "#/components/Button";
import { GuessForm } from "#/components/GuessForm";
import { QuitButton } from "#/components/QuitButton";
import { Results } from "#/components/Results";
import { ScoreBox } from "#/components/ScoreBox";
import { VolumeSlider } from "#/components/VolumeSlider";
import type { Track } from "#/data/ost";
import { useGame, getVisualizerColor } from "#/util/trivia";
import { useHighScore } from "#/util/util";
import NumberFlow from "@number-flow/react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { match } from "ts-pattern";
import styles from "./index.module.css";

export const Route = createFileRoute("/streak/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [streak, setStreak] = useState(0);
	const [losingTrack, setLosingTrack] = useState<Track | null>(null);
	const [highScore, setHighScore] = useHighScore("streak");

	const game = useGame({
		onCorrect: guesses => {
			setStreak(streak + 1);
			if (streak + 1 > highScore) setHighScore(streak + 1);
		},
		onGiveUp: track => {
			setLosingTrack(track);
		},
		onPlayAgain: () => {
			setStreak(0);
		},
	});

	const body = match(game.loadState)
		.with("none", () => null)
		.with("loading", () => <h1>Loading</h1>)
		.with("results", () => (
			<Results onPlayAgain={game.playAgain}>
				<p>Final Streak: {streak}</p>
				<p>Lost to: {losingTrack?.name ?? "?"}</p>
				{streak === highScore ? <p className={styles.new}>New high score!</p> : null}
			</Results>
		))
		.with("done", "correct", "give_up", () => (
			<>
				{match(game.loadState)
					.with("done", () => <h1>Guess the currently playing song.</h1>)
					.with("correct", () => <h1 className={styles.correct}>Correct!</h1>)
					.with("give_up", () => <h1 className={styles.failed}>Streak ended.</h1>)
					.otherwise(() => "")}
				<GuessForm
					guess={game.guess}
					setGuess={game.setGuess}
					wrong={game.wrong}
					loadState={game.loadState}
					track={game.track}
					onSubmit={game.submit}
					onGiveUp={game.giveUp}
					inputRef={game.inputRef}
					nextAction={
						game.loadState === "give_up" ? (
							<Button type="button" onClick={game.goToResults} autoFocus>
								Go to Results
							</Button>
						) : game.loadState === "correct" ? (
							<Button type="button" onClick={game.randomize} autoFocus>
								Next
							</Button>
						) : null
					}
				/>
			</>
		))
		.exhaustive();

	return (
		<div className={styles.content}>
			<header className={`${styles.header} ${styles.streakHeader}`}>
				<h1>Streak</h1>
				<p data-new={highScore === streak || null}>
					Current Streak: <NumberFlow value={streak} />
				</p>
			</header>
			<ScoreBox isNew={highScore === streak}>
				<p>
					High Score: <NumberFlow value={highScore} />
				</p>
			</ScoreBox>
			{game.analyzer && <AudioVisualizer analyzer={game.analyzer} color={getVisualizerColor(game.loadState)} />}
			<div className={styles.container}>{body}</div>
			<VolumeSlider volume={game.volume} setVolume={game.setVolume} />
			<QuitButton prompt={"Quit? Your progress will not be saved."} />
			<AnimatePresence>
				<motion.div className={styles.backgroundContainer} key={game.background} exit={{ opacity: 0 }}>
					<Background type={game.background} />
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
