import { useEffect, useRef } from "react";
import { useEventListener, useInterval } from "usehooks-ts";
import styles from "./Background.module.css";
import battle from "@/assets/img/background/battle.png";
import snow from "@/assets/img/background/snow.png";
import snowy from "@/assets/img/background/snowy.png";
import cardCastle from "@/assets/img/background/card_castle.png";

import { match } from "ts-pattern";

export type BackgroundType = "battle" | "green_room" | "card_castle";

export const Background = ({ type }: { type: BackgroundType }) => {
	return match(type)
		.with("battle", () => (
			<div
				style={{
					backgroundImage: `url("${battle}")`,
				}}
				className={`${styles.background} ${styles.battle}`}
			/>
		))
		.with("card_castle", () => (
			<div
				style={{
					backgroundImage: `url("${cardCastle}")`,
				}}
				className={`${styles.background}`}
			/>
		))
		.with("green_room", () => (
			<div
				style={{
					backgroundImage: `url("${snowy}")`,
				}}
				className={styles.background}
			>
				<div
					style={{
						backgroundImage: `url("${snow}")`,
					}}
					className={`${styles.background} ${styles.snow}`}
				/>
				<div
					style={{
						backgroundImage: `url("${snow}")`
					}}
					className={`${styles.background} ${styles.snow2}`}
				/>
			</div>
		))
		.exhaustive();
};
