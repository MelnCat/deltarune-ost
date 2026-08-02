import { useNavigate } from "@tanstack/react-router";
import { Button } from "./Button";
import styles from "./QuitButton.module.css";

export const QuitButton = ({ prompt = "Quit? Progress will not be saved.", extraBottomSpace = false }: { prompt?: string, extraBottomSpace?: boolean }) => {
	const navigate = useNavigate();
	const quit = () => {
		if (!confirm(prompt)) return;
		navigate({ to: "/" });
	};
	return (
		<Button className={`${styles.quit} ${extraBottomSpace ? styles.extraBottomSpace : ""}`} onClick={quit}>
			Quit
		</Button>
	);
};
