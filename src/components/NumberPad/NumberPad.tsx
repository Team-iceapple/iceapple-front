import { useEffect, useRef } from "react";
import styles from "./NumberPad.module.css";

type Props = {
    value: string;
    setValue: (val: string) => void;
    maxLength?: number;
    className?: string;
    style?: React.CSSProperties;
    onClose?: () => void;
    onSubmit?: (val: string) => void;
    variant?: "default" | "phone";
};

export default function NumberPad({
                                      value,
                                      setValue,
                                      maxLength = 4,
                                      className,
                                      style,
                                      onClose,
                                      onSubmit,
                                      variant = "default",
                                  }: Props) {
    const holdTimer = useRef<number | null>(null);
    const repeatTimer = useRef<number | null>(null);

    const keys =
        variant === "phone"
            ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "010", "0", "⌫"]
            : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

    const handleClick = (k: string) => {
        if (!k || k === "⌫" || k === "⏎" || k === "✕") return;
        const next = value + k;
        if (next.length <= maxLength) setValue(next);
        if (next.length === maxLength && onSubmit) onSubmit(next);
    };

    const handleBackspaceOnce = () => setValue(value.slice(0, -1));

    const startBackspaceHold = () => {
        // handleBackspaceOnce();
        // holdTimer.current = window.setTimeout(() => {
        //     repeatTimer.current = window.setInterval(() => {
        //         setValue((v) => {
        //             console.info(`hi ${v}`);
        //             console.info(typeof v);
        //             v.slice(0, -1)});
        //     }, 60);
        // }, 350);
    };

    const stopBackspaceHold = () => {
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }
        if (repeatTimer.current) {
            clearInterval(repeatTimer.current);
            repeatTimer.current = null;
        }
    };

    useEffect(() => {
        return () => stopBackspaceHold();
    }, []);

    return (
        <div className={`${styles.padContainer} ${className ?? ""}`} style={style}>
            <div className={styles.padGrid}>
                {keys.map((k, i) => {
                    if (k === "✕" && onClose) {
                        return (
                            <button
                                key={`close-${i}`}
                                className={`${styles.padBtn} ${styles.closeBtn}`}
                                onClick={onClose}
                                aria-label="닫기"
                                draggable={false}
                            >
                                ✕
                            </button>
                        );
                    }
                    if (k === "⌫") {
                        return (
                            <button
                                key={`backspace-${i}`}
                                className={`${styles.padBtn} ${styles.backspace}`}
                                onClick={handleBackspaceOnce}
                                onMouseDown={startBackspaceHold}
                                onMouseUp={stopBackspaceHold}
                                onMouseLeave={stopBackspaceHold}
                                onTouchStart={startBackspaceHold}
                                onTouchEnd={stopBackspaceHold}
                                aria-label="지우기"
                                draggable={false}
                            >
                                ⌫
                            </button>
                        );
                    }
                    return (
                        <button
                            key={`num-${k || "blank"}-${i}`}
                            className={styles.padBtn}
                            onClick={() => handleClick(k)}
                            aria-label={k ? `입력 ${k}` : "빈칸"}
                            disabled={!k}
                            draggable={false}
                        >
                            {k}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
