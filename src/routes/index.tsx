import { AudioVisualizer } from "#/components/AudioVisualizer";
import { MainLink } from "#/components/MainLink";
import { tracks } from "#/data/ost";
import { useAudio } from "#/util/audio";
import { useGauntletResults, useHighScore } from "#/util/util";
import deltaruneHeart from "@/assets/img/deltarune_heart.svg";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { match } from "ts-pattern";
import board_sword_music from "../assets/music/board_sword_music.ogg";
import castle_top from "../assets/music/castle_top.ogg";
import ch3_board3 from "../assets/music/ch3_board3.ogg";
import festival from "../assets/music/festival.ogg";
import mansion from "../assets/music/mansion.ogg";
import styles from "./index.module.css";
import { VolumeSlider } from "#/components/VolumeSlider";
import { useLocalStorage } from "usehooks-ts";

export const Route = createFileRoute("/")({ component: App });

const randomAudio = [ch3_board3, festival, castle_top, board_sword_music, mansion];
function App() {
	const [hovered, setHovered] = useState("");
	const [audioPaths] = useState(() => [randomAudio[Math.floor(Math.random() * randomAudio.length)]]);
	const [results] = useGauntletResults();
	const [streakHighScore] = useHighScore("streak");
	const [timedHighScore] = useHighScore("timed");
	const [sampleHighScore] = useHighScore("sample");
	const [volume, setVolume] = useLocalStorage("volume", 100);

	const audio = useAudio({
		volume,
		paths: audioPaths,
	});

	const description = match(hovered)
		.with("streak", () => "Keep going until you fail to guess a song in 3 tries. Try to get a high score!")
		.with("gauntlet", () => "Go through every single OST track in a random order, and see how many of them you remember!")
		.with("timed", () => "Guess as many tracks as possible in 30 seconds! Each correct guess adds an extra 5 seconds.")
		.with("sample", () => "Try to guess tracks based on 5 second snippets. You lose when you fail to get 3 tracks.")
		.with("dual", () => ".")
		.with("scc", () => "Streak mode but it's all Sweet Cap'n Cakes.")
		.otherwise(() => "Made by melncat.");

	return (
		<main className={styles.main}>
			<div className={styles.title}>
				<div className={styles.logo}>
					<img src={deltaruneHeart} alt="DELTARUNE" />
					<div className={`${styles.logoOverlay} ${styles.logoSolidOverlay}`}></div>
					<div className={`${styles.logoOverlay} ${styles.logoImageOverlay}`}></div>
				</div>
				<h1>Soundtrack Trivia</h1>
			</div>
			<section className={`${styles.panes} ${results?.length ? styles.wide : ""}`}>
				<section>
					<MainLink to="/streak" active={hovered === "streak"} onHover={() => setHovered("streak")}>
						Streak
						{streakHighScore ? <span className={styles.gray}> (Best: {streakHighScore})</span> : null}
					</MainLink>
					<MainLink to="/gauntlet" active={hovered === "gauntlet"} onHover={() => setHovered("gauntlet")}>
						OST Gauntlet
						{results?.length ? (
							<span className={styles.gray}>
								{" "}
								({results.length}/{tracks.length})
							</span>
						) : null}
					</MainLink>
					<MainLink to="/timed" active={hovered === "timed"} onHover={() => setHovered("timed")}>
						Timed
						{timedHighScore ? <span className={styles.gray}> (Best: {timedHighScore})</span> : null}
					</MainLink>
					<MainLink to="/sample" active={hovered === "sample"} onHover={() => setHovered("sample")}>
						Sample
						{sampleHighScore ? <span className={styles.gray}> (Best: {sampleHighScore})</span> : null}
					</MainLink>
					<MainLink to="/dual" active={hovered === "dual"} onHover={() => setHovered("dual")}>
						Dual
					</MainLink>
					<MainLink to="/scc" active={hovered === "scc"} onHover={() => setHovered("scc")}>
						Sweet Cap'n Cakes
					</MainLink>
				</section>
				<section>
					<p className={styles.gray}>{description}</p>
				</section>
			</section>
			{audio.analyzer && <AudioVisualizer analyzer={audio.analyzer} color="#141c6a" />}
			<VolumeSlider volume={volume} setVolume={setVolume} />
		</main>
	);
}
