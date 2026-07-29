import { createFileRoute, Link } from "@tanstack/react-router";
import styles from "./index.module.css";
import deltaruneHeart from "@/assets/img/deltarune_heart.svg";
import { useBgm } from "#/util/bgm";
import ch3_board3 from "../assets/music/ch3_board3.ogg";
import { MainLink } from "#/components/MainLink";

export const Route = createFileRoute("/")({ component: App });

function App() {
    useBgm(ch3_board3, 0.5)
	return (
		<main>
            <div className={styles.title}>
                <div className={styles.logo}>
                    <img src={deltaruneHeart} alt="DELTARUNE" />
                    <div className={`${styles.logoOverlay} ${styles.logoSolidOverlay}`}></div>
                    <div className={`${styles.logoOverlay} ${styles.logoImageOverlay}`}></div>
                </div>
                <h1>Soundtrack Trivia</h1>
                <MainLink to="trivia">Trivia</MainLink>
            </div>
		</main>
	);
}
