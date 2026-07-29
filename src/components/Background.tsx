import { useEffect, useRef } from "react";
import { useEventListener, useInterval } from "usehooks-ts";
import styles from "./Background.module.css";
import background from "@/assets/img/background.png";

export const Background = () => {
	return <div style={{
        backgroundImage: `url("${background}")`
    }} className={styles.background} />;
};
