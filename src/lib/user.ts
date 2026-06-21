import type { User } from '@supabase/supabase-js';

export function getUserFirstName(user: User | undefined): string {
  const firstName = user?.user_metadata?.first_name;
  if (typeof firstName === 'string' && firstName.trim()) {
    return firstName.trim();
  }

  const fullName = user?.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim().split(/\s+/)[0];
  }

  const emailName = user?.email?.split('@')[0];
  return emailName || 'Athlete';
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
