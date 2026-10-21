const TITLES = /^(dr|nurse|mr|mrs|ms|miss|prof)\.?$/i;

/** "Dr. Sarah Wilson" → "Sarah" */
export function firstName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.find((p) => !TITLES.test(p)) ?? parts[0] ?? name;
}

export function ageFrom(dateOfBirth: string, today = new Date()): number {
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function greeting(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
