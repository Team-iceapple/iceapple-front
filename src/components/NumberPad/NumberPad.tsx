import styles from "./NumberPad.module.css";

export default function NumberPad({
                                      value,
                                      setValue,
                                      maxLength = 4,
                                  }: {
    value: string;
    setValue: (val: string) => void;
    maxLength?: number;
}) {
    const handleClick = (num: string) => {
        if (value.length < maxLength) setValue(value + num);
    };

    const handleBackspace = () => setValue(value.slice(0, -1));

    return (
        <div className={styles.padContainer}>
            <div className={styles.padGrid}>
                {[
                    "1", "2", "3",
                    "4", "5", "6",
                    "7", "8", "9",
                    "","0",""
                ].map((n) => (
                    <button
                        key={n}
                        className={styles.padBtn}
                        onClick={() => handleClick(n)}
                    >
                        {n}
                    </button>
                ))}

                <button
                    className={`${styles.padBtn} ${styles.backspace}`}
                    onClick={handleBackspace}
                >
                    ⌫
                </button>
            </div>
        </div>
    );
}
