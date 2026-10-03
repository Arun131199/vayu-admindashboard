// Date helpers for RPC batches. Dates are handled as local "YYYY-MM-DD" strings
// so there is no timezone shift between the browser and the backend.

export const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseISODate = (value: string): Date => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const todayISO = (): string => toISODate(new Date());

export const formatBatchDate = (value: string): string =>
  parseISODate(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// start + n months - 1 day  (e.g. 6 Oct + 1 month => 5 Nov)
export const addMonthsMinusOneDay = (start: Date, months: number): Date => {
  const end = new Date(start.getFullYear(), start.getMonth() + months, 1);
  const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  end.setDate(Math.min(start.getDate(), lastDay));
  end.setDate(end.getDate() - 1);
  return end;
};

export const dayLabel = (day: string): string => day.charAt(0) + day.slice(1).toLowerCase();