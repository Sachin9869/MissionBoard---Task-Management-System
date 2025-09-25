import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { taskItemReducer } from './task-item.reducer';
import { TaskItemEffects } from './task-item.effects';
import { TaskItemListComponent } from './task-item-list/task-item-list.component';
import { TaskItemEditComponent } from './task-item-edit/task-item-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TaskItemListComponent,
    TaskItemEditComponent,
    StoreModule.forFeature('taskItem', taskItemReducer),
    EffectsModule.forFeature([TaskItemEffects])
  ],
  exports: [TaskItemListComponent, TaskItemEditComponent]
})
export class TaskItemModule {}
