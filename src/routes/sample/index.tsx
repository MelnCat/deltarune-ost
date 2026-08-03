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

export const Route = createFileRoute("/sample/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useHighScore("sample");
	const [failed, setFailed] = useState(0);

	const game = useGame({
		onCorrect: guesses => {
			setScore(score + 1);
			if (score + 1 > highScore) setHighScore(score + 1);
		},
		onGiveUp: track => {
			setFailed(failed + 1);
		},
		onPlayAgain: () => {
			setScore(0);
			setFailed(0);
		},
		enabledWrong: 3 - failed,
	});

	const body = match(game.loadState)
		.with("none", () => null)
		.with("loading", () => <h1>Loading</h1>)
		.with("results", () => (
			<Results onPlayAgain={game.playAgain}>
				<p>Final Score: {score}</p>
				{score === highScore ? <p className={styles.new}>New high score!</p> : null}
			</Results>
		))
		.with("done", "correct", "give_up", () => (
			<>
				{match(game.loadState)
					.with("done", () => <h1>Guess the currently playing song.</h1>)
					.with("correct", () => <h1 className={styles.correct}>Correct!</h1>)
					.with("give_up", () => <h1 className={styles.failed}>Incorrect.</h1>)
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
					enabledWrong={game.enabledWrong}
					nextAction={
						failed >= 3 ? (
							<Button type="button" onClick={game.goToResults} autoFocus>
								Go to Results
							</Button>
						) : (
							<Button type="button" onClick={game.randomize} autoFocus>
								Next
							</Button>
						) 
					}
				/>
			</>
		))
		.exhaustive();

	return (
		<div className={styles.content}>
			<header className={`${styles.header} ${styles.streakHeader}`}>
				<h1>Sample</h1>
				<p data-new={highScore === score || null}>
					Current Score: <NumberFlow value={score} />
				</p>
			</header>
			<ScoreBox isNew={highScore === score}>
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
