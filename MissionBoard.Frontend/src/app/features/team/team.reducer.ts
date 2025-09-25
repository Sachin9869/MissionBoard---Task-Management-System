import { createReducer, on } from '@ngrx/store';
import * as TeamActions from './team.actions';
import { Team } from './team.model';

export interface TeamState {
  teams: Team[];
  error: any;
}

export const initialState: TeamState = {
  teams: [],
  error: null
};

export const teamReducer = createReducer(
  initialState,
  on(TeamActions.loadTeamsSuccess, (state, { teams }) => ({ ...state, teams })),
  on(TeamActions.loadTeamsFailure, (state, { error }) => ({ ...state, error })),
  on(TeamActions.addTeamSuccess, (state, { team }) => ({ ...state, teams: [...state.teams, team] })),
  on(TeamActions.addTeamFailure, (state, { error }) => ({ ...state, error })),
  on(TeamActions.updateTeamSuccess, (state, { team }) => ({
    ...state,
    teams: state.teams.map(t => t.id === team.id ? team : t)
  })),
  on(TeamActions.updateTeamFailure, (state, { error }) => ({ ...state, error })),
  on(TeamActions.deleteTeamSuccess, (state, { id }) => ({
    ...state,
    teams: state.teams.filter(t => t.id !== id)
  })),
  on(TeamActions.deleteTeamFailure, (state, { error }) => ({ ...state, error }))
);
