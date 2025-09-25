import { createReducer, on } from '@ngrx/store';
import * as RightsActions from './rights.actions';
import { Rights } from './rights.model';

export interface RightsState {
  rights: Rights[];
  error: any;
}

export const initialState: RightsState = {
  rights: [],
  error: null
};

export const rightsReducer = createReducer(
  initialState,
  on(RightsActions.loadRightsSuccess, (state, { rights }) => ({ ...state, rights })),
  on(RightsActions.loadRightsFailure, (state, { error }) => ({ ...state, error })),
  on(RightsActions.addRightsSuccess, (state, { rights }) => ({ ...state, rights: [...state.rights, rights] })),
  on(RightsActions.addRightsFailure, (state, { error }) => ({ ...state, error })),
  on(RightsActions.updateRightsSuccess, (state, { rights }) => ({
    ...state,
    rights: state.rights.map(r => r.id === rights.id ? rights : r)
  })),
  on(RightsActions.updateRightsFailure, (state, { error }) => ({ ...state, error })),
  on(RightsActions.deleteRightsSuccess, (state, { id }) => ({
    ...state,
    rights: state.rights.filter(r => r.id !== id)
  })),
  on(RightsActions.deleteRightsFailure, (state, { error }) => ({ ...state, error }))
);
