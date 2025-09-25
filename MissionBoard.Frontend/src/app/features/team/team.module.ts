import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { teamReducer } from './team.reducer';
import { TeamEffects } from './team.effects';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamEditComponent } from './team-edit/team-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TeamListComponent,
    TeamEditComponent,
    StoreModule.forFeature('team', teamReducer),
    EffectsModule.forFeature([TeamEffects])
  ],
  exports: [TeamListComponent, TeamEditComponent]
})
export class TeamModule {}
