const formatter = new Intl.RelativeTimeFormat('en');
export const timeAgo = (ms: number): string => {
  const sec = Math.round(ms / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  const month = Math.round(day / 30);
  const year = Math.round(month / 12);
  if (sec < 10) {
    return 'just now';
  } else if (sec < 45) {
    return formatter.format(-sec, 'second');
  } else if (sec < 90 || min < 45) {
    return formatter.format(-min, 'minute');
  } else if (min < 90 || hr < 24) {
    return formatter.format(-hr, 'hour');
  } else if (hr < 36 || day < 30) {
    return formatter.format(-day, 'day');
  } else if (month < 18) {
    return formatter.format(-month, 'month');
  } else {
    return formatter.format(-year, 'year');
  }
};

export const parseDurationToMs = (duration: string): number => {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) throw new Error('Invalid duration format');

  const [_, amountStr, unit] = match;
  const amount = parseInt(amountStr, 10);

  switch (unit) {
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 's':
      return amount * 1000;
    default:
      throw new Error('Unknown time unit');
  }
};

export const formatUnixTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  return date.toLocaleString('en-US', {
    timeZone: 'UTC', // Or use your local timezone like 'America/New_York'
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};
