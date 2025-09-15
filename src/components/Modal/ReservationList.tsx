import { useEffect, useState } from "react";
import styles from "./Modal.module.css";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}place`;

interface Reservation {
    id: string;
    date: string;
    times: number[];
    place: { id: string; name: string };
}

type CancelledItem = { date: string; times: string[]; room: string };

interface ReservationListProps {
    studentId: string;
    password: string;
    setStep: (s: "login" | "loginError" | "reservationList" | "CancelSuccess") => void;
    setCancelledData: (data: CancelledItem[]) => void; // CancelSuccess와 동일 타입
}

const ReservationList = ({ studentId, password, setStep, setCancelledData }: ReservationListProps) => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // 예약 목록 조회
    useEffect(() => {
        const fetchReservations = async () => {
            if (!studentId || !password) return;
            try {
                setLoading(true);
                setError(null);

                const res = await axios.post(`${API_BASE_URL}/reservations/reservation-info`, {
                    student_number: studentId,
                    password,
                });

                setReservations(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error(e);
                setError("예약 내역을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [studentId, password]);

    const toggle = (id: string) =>
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const fmtTime = (h: number) => `${String(h).padStart(2, "0")}:00`;
    const fmtDateISO = (iso: string) => iso.split("T")[0];

    const handleCancel = async () => {
        if (selectedIds.length === 0) return;

        try {
            setLoading(true);
            setError(null);

            const cancelledForUI = reservations
                .filter(r => selectedIds.includes(r.id))
                .map(r => ({
                    date: r.date,
                    times: (r.times ?? []).map(fmtTime),
                    room: r.place?.name ?? "",
                }));

            await axios.delete(`${API_BASE_URL}/reservations`, {
                data: {
                    reservation_id: selectedIds,
                },
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            setCancelledData(cancelledForUI);
            setReservations(prev => prev.filter(r => !selectedIds.includes(r.id)));
            setSelectedIds([]);
            setStep("CancelSuccess");
        } catch (e: any) {
            console.error(e?.response || e);
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                "예약 취소에 실패했습니다.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.listContainer}>
                <div className={styles.confirmationId}>{studentId} 님의 예약 내역</div>

                <div className={styles.reservationList}>
                    {loading && <div className={styles.empty}>불러오는 중…</div>}

                    {!loading && reservations.length === 0 && !error && (
                        <div className={styles.empty}>예약 내역이 없습니다.</div>
                    )}

                    {!loading &&
                        reservations.map((res) => (
                            <label key={res.id}>
                                <div className={styles.reservationInfo}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={selectedIds.includes(res.id)}
                                        onChange={() => toggle(res.id)}
                                    />
                                    <div className={styles.dateColumn}>{fmtDateISO(res.date)}</div>
                                    <div className={styles.timeColumn}>
                                        {res.times.map((t, i) => (
                                            <div key={i}>{fmtTime(t)}</div>
                                        ))}
                                    </div>
                                    <div className={styles.roomColumn}>{res.place.name}</div>
                                </div>
                            </label>
                        ))}
                </div>
            </div>
            <div className={styles.buttonSection}>
                <button
                    className={styles.submitBtn}
                    onClick={handleCancel}
                    disabled={selectedIds.length === 0 || loading}
                >
                    {loading ? "취소 중..." : "선택한 예약 삭제"}
                </button>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}
        </>
    );
};

export default ReservationList;
