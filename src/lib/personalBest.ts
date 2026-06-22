import type { PersonalBest, PersonalBestAchievement } from '../types/personalBest';
import type { CompletedWorkout, WorkoutExercise } from '../types/workout';
import { getHeaviestCompletedSet } from './workout';

export function calculatePersonalBests(
  workouts: CompletedWorkout[],
  trackedExerciseIds: ReadonlySet<string>,
): Map<string, PersonalBest> {
  const personalBests = new Map<string, PersonalBest>();

  sortWorkoutsOldestFirst(workouts).forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const exerciseId = exercise.catalogExerciseId;
      if (!exerciseId || !trackedExerciseIds.has(exerciseId)) return;

      const bestSet = getHeaviestCompletedSet(exercise);
      const current = personalBests.get(exerciseId);
      if (!bestSet || (current && bestSet.weightKg <= current.weightKg)) return;

      personalBests.set(exerciseId, {
        exerciseId,
        exerciseName: exercise.name,
        weightKg: bestSet.weightKg,
      });
    });
  });

  return personalBests;
}

export function findLatestPersonalBestAchievement(
  workouts: CompletedWorkout[],
  trackedExerciseIds: ReadonlySet<string>,
): PersonalBestAchievement | null {
  const standingRecords = new Map<string, number>();
  let latestAchievement: PersonalBestAchievement | null = null;

  for (const workout of sortWorkoutsOldestFirst(workouts)) {
    const workoutAchievements: (PersonalBestAchievement & { exercisePosition: number })[] = [];

    workout.exercises.forEach((exercise, exercisePosition) => {
      const exerciseId = exercise.catalogExerciseId;
      if (!exerciseId || !trackedExerciseIds.has(exerciseId)) return;

      const bestSet = getHeaviestCompletedSet(exercise);
      if (!bestSet) return;

      const previousWeightKg = standingRecords.get(exerciseId);
      if (previousWeightKg !== undefined && bestSet.weightKg > previousWeightKg) {
        const candidate = {
          workoutId: workout.id,
          completedAt: workout.completedAt,
          exerciseId,
          exerciseName: exercise.name,
          previousWeightKg,
          weightKg: bestSet.weightKg,
          improvementKg: bestSet.weightKg - previousWeightKg,
          exercisePosition,
        };

        workoutAchievements.push(candidate);
      }

      if (previousWeightKg === undefined || bestSet.weightKg > previousWeightKg) {
        standingRecords.set(exerciseId, bestSet.weightKg);
      }
    });

    const workoutAchievement = workoutAchievements.sort(compareAchievements)[0];
    if (workoutAchievement) {
      const { exercisePosition: _exercisePosition, ...achievement } = workoutAchievement;
      latestAchievement = achievement;
    }
  }

  return latestAchievement;
}

export function getLivePersonalBestSetId(
  exercise: WorkoutExercise,
  standingPersonalBestKg: number | undefined,
): string | undefined {
  if (standingPersonalBestKg === undefined) return undefined;
  const bestSet = getHeaviestCompletedSet(exercise);
  return bestSet && bestSet.weightKg > standingPersonalBestKg ? bestSet.id : undefined;
}

function sortWorkoutsOldestFirst(workouts: CompletedWorkout[]) {
  return [...workouts].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );
}

function compareAchievements(
  a: PersonalBestAchievement & { exercisePosition: number },
  b: PersonalBestAchievement & { exercisePosition: number },
) {
  if (a.improvementKg !== b.improvementKg) {
    return b.improvementKg - a.improvementKg;
  }
  if (a.weightKg !== b.weightKg) return b.weightKg - a.weightKg;
  return a.exercisePosition - b.exercisePosition;
}
