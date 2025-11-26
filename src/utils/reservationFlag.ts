export const STORAGE_KEY = 'reservationEnabled';

export function isReservationEnabled(): boolean {
	if (typeof window === 'undefined') return false;
	const v = sessionStorage.getItem(STORAGE_KEY);
	if (v === null) return false;
	return v === 'on';
}

export function setReservationEnabled(enabled: boolean): void {
	if (typeof window === 'undefined') return;
	sessionStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
}

export function getReservationEnabled(): boolean | null {
	if (typeof window === 'undefined') return null;
	const value = sessionStorage.getItem(STORAGE_KEY);
	if (value === null) return null;
	return value === 'on';
}

export function getToggleFromSearch(search: string): boolean | null {
	try {
		const params = new URLSearchParams(search || '');
		const reserve = params.get('reserve');
		if (reserve == null) return null;
		const v = reserve.trim().toLowerCase();
		if (v === '') return true;
		if (['1', 'true', 'on', 'yes', 'y', 'enable', 'enabled'].includes(v)) return true;
		if (['0', 'false', 'off', 'no', 'n', 'disable', 'disabled'].includes(v)) return false;
		return null;
	} catch {
		return null;
	}
}


