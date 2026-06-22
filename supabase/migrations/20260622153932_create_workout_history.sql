create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  name text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds > 0),
  created_at timestamptz not null default now(),
  constraint workouts_completed_after_started check (completed_at >= started_at),
  constraint workouts_user_client_unique unique (user_id, client_id)
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_name text not null,
  position integer not null check (position >= 0),
  constraint workout_exercises_position_unique unique (workout_id, position)
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  position integer not null check (position >= 0),
  weight_kg numeric(8, 2) not null check (weight_kg >= 0),
  reps integer not null check (reps >= 0),
  constraint workout_sets_position_unique unique (workout_exercise_id, position)
);

create index if not exists workouts_user_completed_at_idx on public.workouts (user_id, completed_at desc);
create index if not exists workout_exercises_workout_id_idx on public.workout_exercises (workout_id);
create index if not exists workout_exercises_exercise_id_idx on public.workout_exercises (exercise_id);
create index if not exists workout_sets_workout_exercise_id_idx on public.workout_sets (workout_exercise_id);

alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;

revoke all privileges on table public.workouts from anon, authenticated;
revoke all privileges on table public.workout_exercises from anon, authenticated;
revoke all privileges on table public.workout_sets from anon, authenticated;
grant select, insert on table public.workouts to authenticated;
grant select, insert on table public.workout_exercises to authenticated;
grant select, insert on table public.workout_sets to authenticated;

drop policy if exists "Users can read their workouts" on public.workouts;
create policy "Users can read their workouts"
on public.workouts for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their workouts" on public.workouts;
create policy "Users can insert their workouts"
on public.workouts for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read their workout exercises" on public.workout_exercises;
create policy "Users can read their workout exercises"
on public.workout_exercises for select
to authenticated
using (
  exists (
    select 1
    from public.workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert their workout exercises" on public.workout_exercises;
create policy "Users can insert their workout exercises"
on public.workout_exercises for insert
to authenticated
with check (
  exists (
    select 1
    from public.workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can read their workout sets" on public.workout_sets;
create policy "Users can read their workout sets"
on public.workout_sets for select
to authenticated
using (
  exists (
    select 1
    from public.workout_exercises
    join public.workouts on workouts.id = workout_exercises.workout_id
    where workout_exercises.id = workout_sets.workout_exercise_id
      and workouts.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert their workout sets" on public.workout_sets;
create policy "Users can insert their workout sets"
on public.workout_sets for insert
to authenticated
with check (
  exists (
    select 1
    from public.workout_exercises
    join public.workouts on workouts.id = workout_exercises.workout_id
    where workout_exercises.id = workout_sets.workout_exercise_id
      and workouts.user_id = (select auth.uid())
  )
);

create or replace function public.save_completed_workout(p_workout jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_workout_id uuid;
  v_exercise_id uuid;
  v_exercise jsonb;
  v_set jsonb;
  v_exercise_position integer;
  v_set_position integer;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if nullif(p_workout ->> 'clientId', '') is null then
    raise exception 'clientId is required.' using errcode = '22023';
  end if;

  if coalesce(jsonb_typeof(p_workout -> 'exercises'), 'null') <> 'array'
    or jsonb_array_length(p_workout -> 'exercises') = 0 then
    raise exception 'At least one completed exercise is required.' using errcode = '22023';
  end if;

  insert into public.workouts (
    user_id,
    client_id,
    name,
    started_at,
    completed_at,
    duration_seconds
  )
  values (
    v_user_id,
    p_workout ->> 'clientId',
    coalesce(nullif(p_workout ->> 'name', ''), 'Workout Session'),
    (p_workout ->> 'startedAt')::timestamptz,
    (p_workout ->> 'completedAt')::timestamptz,
    (p_workout ->> 'durationSeconds')::integer
  )
  on conflict (user_id, client_id) do nothing
  returning id into v_workout_id;

  if v_workout_id is null then
    select id into v_workout_id
    from public.workouts
    where user_id = v_user_id
      and client_id = p_workout ->> 'clientId';
    return v_workout_id;
  end if;

  for v_exercise, v_exercise_position in
    select value, (ordinality - 1)::integer
    from jsonb_array_elements(p_workout -> 'exercises') with ordinality
  loop
    if nullif(v_exercise ->> 'name', '') is null then
      raise exception 'Exercise name is required.' using errcode = '22023';
    end if;

    if coalesce(jsonb_typeof(v_exercise -> 'sets'), 'null') <> 'array'
      or jsonb_array_length(v_exercise -> 'sets') = 0 then
      raise exception 'Every exercise requires a completed set.' using errcode = '22023';
    end if;

    insert into public.workout_exercises (
      workout_id,
      exercise_id,
      exercise_name,
      position
    )
    values (
      v_workout_id,
      nullif(v_exercise ->> 'exerciseId', '')::uuid,
      v_exercise ->> 'name',
      v_exercise_position
    )
    returning id into v_exercise_id;

    for v_set, v_set_position in
      select value, (ordinality - 1)::integer
      from jsonb_array_elements(v_exercise -> 'sets') with ordinality
    loop
      insert into public.workout_sets (
        workout_exercise_id,
        position,
        weight_kg,
        reps
      )
      values (
        v_exercise_id,
        v_set_position,
        (v_set ->> 'weightKg')::numeric,
        (v_set ->> 'reps')::integer
      );
    end loop;
  end loop;

  return v_workout_id;
end;
$$;

revoke execute on function public.save_completed_workout(jsonb) from public, anon;
grant execute on function public.save_completed_workout(jsonb) to authenticated;
