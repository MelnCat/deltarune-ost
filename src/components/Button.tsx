import styles from "./Button.module.css";


export const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
	return (
		<button {...props} className={styles.button}>
			{children}
		</button>
	);
};
