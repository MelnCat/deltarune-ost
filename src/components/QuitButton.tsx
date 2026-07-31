import { useNavigate } from "@tanstack/react-router";
import { Button } from "./Button";
import styles from "./QuitButton.module.css";

export const QuitButton = () => {
	const navigate = useNavigate();
	const quit = () => {
        if (!confirm("Quit? Progress will not be saved.")) return;
		navigate({ to: "/" });
	};
	return (
		<Button className={styles.quit} onClick={quit}>
			Quit
		</Button>
	);
};
