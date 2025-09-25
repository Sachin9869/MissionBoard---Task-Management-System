import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TaskItem } from '../task-item.model';
import * as TaskItemActions from '../task-item.actions';
import { selectAllTaskItems, selectTaskItemError } from '../task-item.selectors';

@Component({
  selector: 'app-task-item-list',
  templateUrl: './task-item-list.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class TaskItemListComponent implements OnInit {
  taskItems$!: Observable<TaskItem[]>;
  error$!: Observable<any>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.taskItems$ = this.store.select(selectAllTaskItems);
    this.error$ = this.store.select(selectTaskItemError);
    this.store.dispatch(TaskItemActions.loadTaskItems());
  }

  deleteTaskItem(id: number) {
    this.store.dispatch(TaskItemActions.deleteTaskItem({ id }));
  }
}
