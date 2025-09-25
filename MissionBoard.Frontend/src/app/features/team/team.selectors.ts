import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TeamState } from './team.reducer';

export const selectTeamState = createFeatureSelector<TeamState>('team');

export const selectAllTeams = createSelector(
  selectTeamState,
  (state: TeamState) => state.teams
);

export const selectTeamError = createSelector(
  selectTeamState,
  (state: TeamState) => state.error
);
