import styles from "./NumberPad.module.css";

export default function NumberPad({
                                      value,
                                      setValue,
                                      maxLength = 4,
                                      className,
                                      style,
                                      onClose,
                                  }: {
    value: string;
    setValue: (val: string) => void;
    maxLength?: number;
    className?: string;
    style?: React.CSSProperties;
    onClose?: () => void;
}) {
    const handleClick = (num: string) => {
        if (value.length < maxLength) setValue(value + num);
    };

    const handleBackspace = () => setValue(value.slice(0, -1));

    const keys = [
        "1", "2", "3",
        "4", "5", "6",
        "7", "8", "9",
        "", "0", "⌫"
    ];

    return (
        <div className={`${styles.padContainer} ${className ?? ""}`} style={style}>
            <div className={styles.padGrid}>
                {keys.map((k, i) => {
                    if (k === "✕") {
                        return (
                            <button
                                key={`close-${i}`}
                                className={`${styles.padBtn} ${styles.closeBtn}`}
                                onClick={() => onClose?.()}
                                aria-label="닫기"
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
                                onClick={handleBackspace}
                                aria-label="지우기"
                            >
                                ⌫
                            </button>
                        );
                    }
                    return (
                        <button
                            key={`num-${k}-${i}`}
                            className={styles.padBtn}
                            onClick={() => handleClick(k)}
                            aria-label={`입력 ${k}`}
                        >
                            {k}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}