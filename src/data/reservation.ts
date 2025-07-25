export const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const startHour = 9 + i;
    const endHour = startHour + 1;
    const format = (h: number) => h.toString().padStart(2, "0") + ":00";
    return `${format(startHour)} ~ ${format(endHour)}`;
});

export const mockAvailability: Record<string, boolean> = timeSlots.reduce((acc, slot, idx) => {
    acc[slot] = idx % 2 === 0;
    return acc;
}, {} as Record<string, boolean>);
