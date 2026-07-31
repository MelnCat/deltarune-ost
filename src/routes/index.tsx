import { MainLink } from "#/components/MainLink";
import { useBgm } from "#/util/bgm";
import deltaruneHeart from "@/assets/img/deltarune_heart.svg";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { match } from "ts-pattern";
import ch3_board3 from "../assets/music/ch3_board3.ogg";
import styles from "./index.module.css";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [hovered, setHovered] = useState("");

	const description = match(hovered)
		.with("streak", () => "Keep going until you fail to guess a song in 3 tries. Try to get a high score!")
		.with("gauntlet", () => "Go through every single OST track in a random order, and see how many of them you remember!")
		.otherwise(() => "Made by melncat.");

	useBgm(ch3_board3, 0.5);
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
			<section className={styles.panes}>
				<section>
					<MainLink to="streak" active={hovered === "streak"} onHover={() => setHovered("streak")}>
						Streak
					</MainLink>
					<MainLink to="gauntlet" active={hovered === "gauntlet"} onHover={() => setHovered("gauntlet")}>
						OST Gauntlet
					</MainLink>
				</section>
				<section>
					<p className={styles.description}>{description}</p>
				</section>
			</section>
		</main>
	);
}
