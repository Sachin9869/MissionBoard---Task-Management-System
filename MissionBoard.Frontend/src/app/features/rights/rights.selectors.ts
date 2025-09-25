import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RightsState } from './rights.reducer';

export const selectRightsState = createFeatureSelector<RightsState>('rights');

export const selectAllRights = createSelector(
  selectRightsState,
  (state: RightsState) => state.rights
);

export const selectRightsError = createSelector(
  selectRightsState,
  (state: RightsState) => state.error
);
