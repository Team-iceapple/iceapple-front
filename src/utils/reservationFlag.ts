export const RESERVE_STORAGE_KEY = 'IA_RESERVE_ENABLED';

export function isReservationEnabled(): boolean {
	if (typeof window === 'undefined') return false;
	return sessionStorage.getItem(RESERVE_STORAGE_KEY) === '1';
}

export function setReservationEnabled(enabled: boolean): void {
	if (typeof window === 'undefined') return;
	if (enabled) {
		sessionStorage.setItem(RESERVE_STORAGE_KEY, '1');
	} else {
		sessionStorage.removeItem(RESERVE_STORAGE_KEY);
	}
}

function parseBooleanLike(value: string | null | undefined): boolean | null {
	if (value == null) return null;
	const v = value.trim().toLowerCase();
	if (['1', 'true', 'on', 'yes', 'y', 'enable', 'enabled'].includes(v)) return true;
	if (['0', 'false', 'off', 'no', 'n', 'disable', 'disabled'].includes(v)) return false;
	return null;
}

export function getToggleFromSearch(search: string): boolean | null {
	try {
		const params = new URLSearchParams(search || '');
		const raw = params.get('reserve');
		return parseBooleanLike(raw);
	} catch {
		return null;
	}
}


