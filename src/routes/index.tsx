import { MainLink } from "#/components/MainLink";
import { useBgm } from "#/util/bgm";
import deltaruneHeart from "@/assets/img/deltarune_heart.svg";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { match } from "ts-pattern";
import ch3_board3 from "../assets/music/ch3_board3.ogg";
import festival from "../assets/music/festival.ogg";
import castle_top from "../assets/music/castle_top.ogg";
import board_sword_music from "../assets/music/board_sword_music.ogg";
import mansion from "../assets/music/mansion.ogg";
import styles from "./index.module.css";
import { useAudio } from "#/util/audio";
import { AudioVisualizer } from "#/components/AudioVisualizer";
import { useLocalStorage } from "usehooks-ts";
import { useGauntletResults } from "#/util/util";
import { tracks } from "#/data/ost";
import { Background } from "#/components/Background";

export const Route = createFileRoute("/")({ component: App });

const randomAudio = [ch3_board3, festival, castle_top, board_sword_music, mansion];
function App() {
	const [hovered, setHovered] = useState("");
	const [audioPaths] = useState(() => [randomAudio[Math.floor(Math.random() * randomAudio.length)]]);
	const [results, setResults] = useGauntletResults();

	const audio = useAudio({
		volume: 50,
		paths: audioPaths,
	});

	const description = match(hovered)
		.with("streak", () => "Keep going until you fail to guess a song in 3 tries. Try to get a high score!")
		.with("gauntlet", () => "Go through every single OST track in a random order, and see how many of them you remember!")
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
				</section>
				<section>
					<p className={styles.gray}>{description}</p>
				</section>
			</section>
			{audio.analyzer && <AudioVisualizer analyzer={audio.analyzer} color="#141c6a" />}
		</main>
	);
}
