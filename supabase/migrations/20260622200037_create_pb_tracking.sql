create table if not exists public.pb_tracked_exercises (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create index if not exists pb_tracked_exercises_exercise_id_idx
on public.pb_tracked_exercises (exercise_id);

alter table public.pb_tracked_exercises enable row level security;

revoke all privileges on table public.pb_tracked_exercises from anon, authenticated;
grant select, insert, delete on table public.pb_tracked_exercises to authenticated;

drop policy if exists "Users can read their PB tracking" on public.pb_tracked_exercises;
create policy "Users can read their PB tracking"
on public.pb_tracked_exercises for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can enable PB tracking" on public.pb_tracked_exercises;
create policy "Users can enable PB tracking"
on public.pb_tracked_exercises for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can disable PB tracking" on public.pb_tracked_exercises;
create policy "Users can disable PB tracking"
on public.pb_tracked_exercises for delete
to authenticated
using ((select auth.uid()) = user_id);
