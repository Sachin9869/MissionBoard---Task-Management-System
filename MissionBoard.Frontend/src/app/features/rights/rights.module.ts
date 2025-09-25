import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { rightsReducer } from './rights.reducer';
import { RightsEffects } from './rights.effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RightsListComponent } from './rights-list/rights-list.component';
import { RightsEditComponent } from './rights-edit/rights-edit.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StoreModule.forFeature('rights', rightsReducer),
    EffectsModule.forFeature([RightsEffects]),
    RightsListComponent,
    RightsEditComponent
  ]
})
export class RightsModule {}
