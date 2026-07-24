import { createFileRoute, Link } from "@tanstack/react-router";
import styles from "./index.module.css";
import deltarune from "@/assets/img/deltarune.svg";
import { useBgm } from "#/util/bgm";
import ch3_board3 from "../assets/music/ch3_board3.ogg";

export const Route = createFileRoute("/")({ component: App });

function App() {
    useBgm(ch3_board3, 0.5)
	return (
		<main>
            <div className={styles.title}>
                <img src={deltarune} alt="DELTARUNE" />
                <h1>Soundtrack Trivia</h1>
                <Link to="/trivia">Trivia</Link>
            </div>
		</main>
	);
}
