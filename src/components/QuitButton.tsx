import { useNavigate } from "@tanstack/react-router";
import { Button } from "./Button";
import styles from "./QuitButton.module.css";

export const QuitButton = ({
	prompt = "Quit? Progress will not be saved.",
	extraBottomSpace = null,
}: {
	prompt?: string;
	extraBottomSpace?: "regular" | "extra" | null;
}) => {
	const navigate = useNavigate();
	const quit = () => {
		if (!confirm(prompt)) return;
		navigate({ to: "/" });
	};
	return (
		<Button
			className={`${styles.quit} ${extraBottomSpace === "extra" ? styles.extraBottomSpace : extraBottomSpace === "regular" ? styles.regularBottomSpace : ""}`}
			onClick={quit}
		>
			Quit
		</Button>
	);
};
