

export const formatLongNumber = (n: number): string => {
	return n.toLocaleString("en-US", {minimumFractionDigits: 2});
}