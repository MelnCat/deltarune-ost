import { createFileRoute, Link } from "@tanstack/react-router";
import styles from "./index.module.css";
import deltaruneHeart from "@/assets/img/deltarune_heart.svg";
import { useBgm } from "#/util/bgm";
import ch3_board3 from "../assets/music/ch3_board3.ogg";
import { MainLink } from "#/components/MainLink";
import { useState } from "react";
import { match } from "ts-pattern";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [hovered, setHovered] = useState("");

    const description = match(hovered)
        .with("trivia", () => "Keep going until you fail to guess a song in 3 tries. Try to get a high score!")
        .with("gauntlet", () => "Go through every single OST track in a random order, and see how many of them you remember!")
        .otherwise(() => "Made by melncat.")

	useBgm(ch3_board3, 0.5);
	return (
		<main>
			<div className={styles.title}>
				<div className={styles.logo}>
					<img src={deltaruneHeart} alt="DELTARUNE" />
					<div className={`${styles.logoOverlay} ${styles.logoSolidOverlay}`}></div>
					<div className={`${styles.logoOverlay} ${styles.logoImageOverlay}`}></div>
				</div>
				<h1>Soundtrack Trivia</h1>
				<section className={styles.panes}>
					<section>
						<MainLink to="trivia" active={hovered === "trivia"} onHover={() => setHovered("trivia")}>
							Streak
						</MainLink>
						<MainLink to="gauntlet" active={hovered === "gauntlet"} onHover={() => setHovered("gauntlet")}>
							Entire Fucking OST
						</MainLink>
					</section>
					<section >
						<p className={styles.description}>{description}</p>
					</section>
				</section>
			</div>
		</main>
	);
}
