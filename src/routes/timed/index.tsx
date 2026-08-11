import { AudioVisualizer } from "#/components/AudioVisualizer";
import { Background } from "#/components/Background";
import { Button } from "#/components/Button";
import { GuessForm } from "#/components/GuessForm";
import { QuitButton } from "#/components/QuitButton";
import { Results } from "#/components/Results";
import { ScoreBox } from "#/components/ScoreBox";
import { VolumeSlider } from "#/components/VolumeSlider";
import { useGame, getVisualizerColor } from "#/util/trivia";
import { useHighScore } from "#/util/util";
import NumberFlow from "@number-flow/react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import prettyMs from "pretty-ms";
import { useState } from "react";
import { match } from "ts-pattern";
import { useInterval } from "usehooks-ts";
import styles from "./index.module.css";

export const Route = createFileRoute("/timed/")({
	component: RouteComponent,
});

const START_TIME = 30000;

function RouteComponent() {
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useHighScore("timed");
	const [timeLeft, setTimeLeft] = useState(START_TIME);

	const game = useGame({
		onCorrect: guesses => {
			setScore(score + 1);
			if (score + 1 > highScore) setHighScore(score + 1);
			setTimeLeft(Math.min(START_TIME, timeLeft + 5000));
		},
		onGiveUp: () => {
			setTimeLeft(timeLeft - 1000);
		},
		onPlayAgain: () => {
			setScore(0);
			setTimeLeft(START_TIME);
		},
	});

	useInterval(() => {
		if (timeLeft <= 0) {
			if (game.loadState !== "results") {
                game.goToResults();
            }
		} else if (game.loadState !== "loading" && game.loadState !== "none") {
			setTimeLeft(Math.max(0, timeLeft - 50));
		}
	}, 50);

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
					nextAction={
						<Button type="button" onClick={game.randomize} autoFocus>
							Next
						</Button>
					}
				/>
			</>
		))
		.exhaustive();

	return (
		<div className={styles.content}>
			<header className={`${styles.header}`}>
				<h1>Timed</h1>
				<p>
					Time Left:{" "}
					<span className={styles.time}>
						{timeLeft > 0 ? prettyMs(timeLeft, { keepDecimalsOnWholeSeconds: true, subSecondsAsDecimals: true }) : "Game over!"}
					</span>
				</p>
			</header>
			<div className={styles.container}>{body}</div>
			<ScoreBox isNew={highScore === score}>
				<p>
					Score: <NumberFlow value={score} />
				</p>
				<p data-new={highScore === score || null}>
					High Score: <NumberFlow value={highScore} />
				</p>
			</ScoreBox>
			{game.analyzer && <AudioVisualizer analyzer={game.analyzer} color={getVisualizerColor(game.loadState)} />}
			<VolumeSlider volume={game.volume} setVolume={game.setVolume} />
			<QuitButton prompt={"Quit? Progress will not be saved."} extraBottomSpace={"extra"} />
			<AnimatePresence>
				<motion.div className={styles.backgroundContainer} key={game.background} exit={{ opacity: 0 }}>
					<Background type={game.background} />
				</motion.div>
			</AnimatePresence>
			{game.loadState !== "results" ? (
				<>
					<motion.div className={styles.timeOverlay} animate={{ "--t": Math.max(0, timeLeft / START_TIME) }}></motion.div>
					<motion.div
						className={`${styles.timeOverlay} ${styles.color}`}
						animate={{ "--t": Math.max(0, timeLeft / START_TIME) }}
					></motion.div>
				</>
			) : null}
		</div>
	);
}
