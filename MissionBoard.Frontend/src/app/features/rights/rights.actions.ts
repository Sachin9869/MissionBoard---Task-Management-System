import { createAction, props } from '@ngrx/store';
import { Rights } from './rights.model';

export const loadRights = createAction('[Rights] Load Rights');
export const loadRightsSuccess = createAction('[Rights] Load Rights Success', props<{ rights: Rights[] }>());
export const loadRightsFailure = createAction('[Rights] Load Rights Failure', props<{ error: any }>());

export const addRights = createAction('[Rights] Add Rights', props<{ rights: Rights }>());
export const addRightsSuccess = createAction('[Rights] Add Rights Success', props<{ rights: Rights }>());
export const addRightsFailure = createAction('[Rights] Add Rights Failure', props<{ error: any }>());

export const updateRights = createAction('[Rights] Update Rights', props<{ rights: Rights }>());
export const updateRightsSuccess = createAction('[Rights] Update Rights Success', props<{ rights: Rights }>());
export const updateRightsFailure = createAction('[Rights] Update Rights Failure', props<{ error: any }>());

export const deleteRights = createAction('[Rights] Delete Rights', props<{ id: number }>());
export const deleteRightsSuccess = createAction('[Rights] Delete Rights Success', props<{ id: number }>());
export const deleteRightsFailure = createAction('[Rights] Delete Rights Failure', props<{ error: any }>());
