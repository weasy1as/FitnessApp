create table if not exists public.favorite_workouts (
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_client_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, workout_client_id)
);

alter table public.favorite_workouts enable row level security;

revoke all privileges on table public.favorite_workouts from anon, authenticated;
grant select, insert, delete on table public.favorite_workouts to authenticated;

drop policy if exists "Users can read their favorite workouts" on public.favorite_workouts;
create policy "Users can read their favorite workouts"
on public.favorite_workouts for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can favorite workouts" on public.favorite_workouts;
create policy "Users can favorite workouts"
on public.favorite_workouts for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can unfavorite workouts" on public.favorite_workouts;
create policy "Users can unfavorite workouts"
on public.favorite_workouts for delete
to authenticated
using ((select auth.uid()) = user_id);
