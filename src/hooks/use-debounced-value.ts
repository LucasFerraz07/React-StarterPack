import * as React from "react";

export function useDebouncedValue<T>(value: T, delayMs: number) {
	const [debouncedValue, setDebouncedValue] = React.useState(value);

	React.useEffect(() => {
		const timeout = setTimeout(() => setDebouncedValue(value), delayMs);
		return () => clearTimeout(timeout);
	}, [value, delayMs]);

	return debouncedValue;
}
