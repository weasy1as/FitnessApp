import type { User } from '@supabase/supabase-js';

export function getUserDisplayName(user: User | undefined): string {
  const fullName = user?.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim();
  }

  const firstName = user?.user_metadata?.first_name;
  const lastName = user?.user_metadata?.last_name;
  const combinedName = [firstName, lastName]
    .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
    .map((value) => value.trim())
    .join(' ');

  if (combinedName) {
    return combinedName;
  }

  return user?.email?.split('@')[0] || 'Athlete';
}

export function getUserFirstName(user: User | undefined): string {
  return getUserDisplayName(user).split(/\s+/)[0];
}

export function getUserInitials(user: User | undefined): string {
  const words = getUserDisplayName(user).split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatDashboardDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  })
    .format(date)
    .toUpperCase();
}
