// components/NumberPad.tsx
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
        if (value.length < maxLength) {
            setValue(value + num);
        }
    };

    const handleBackspace = () => {
        setValue(value.slice(0, -1));
    };

    return (
        <div className={styles.padContainer}>
            <div className={styles.padGrid}>
                {[..."123456789", "0"].map((n) => (
                    <button key={n} className={styles.padBtn} onClick={() => handleClick(n)}>
                        {n}
                    </button>
                ))}
                <button
                    className={`${styles.padBtn} ${styles.backspace}`} // ✅ 수정된 부분
                    onClick={handleBackspace}
                >
                    ⌫
                </button>
            </div>
        </div>
    );
}
