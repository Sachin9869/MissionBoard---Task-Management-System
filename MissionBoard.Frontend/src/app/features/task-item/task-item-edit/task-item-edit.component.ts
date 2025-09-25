import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as TaskItemActions from '../task-item.actions';
import { TaskItem } from '../task-item.model';

@Component({
  selector: 'app-task-item-edit',
  templateUrl: './task-item-edit.component.html',
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class TaskItemEditComponent implements OnInit {
  @Input() taskItem: TaskItem | null = null;
  taskItemForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store) {
    this.taskItemForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: [''],
      createdAt: [''],
      dueDate: [''],
      isCompleted: [false],
      assignedToId: [null],
      teamId: [null]
    });
  }

  ngOnInit() {
    if (this.taskItem) {
      this.taskItemForm.patchValue(this.taskItem);
    }
  }

  onSubmit() {
    if (this.taskItemForm.valid) {
      const taskItem: TaskItem = this.taskItemForm.value;
      if (taskItem.id) {
        this.store.dispatch(TaskItemActions.updateTaskItem({ taskItem }));
      } else {
        this.store.dispatch(TaskItemActions.addTaskItem({ taskItem }));
      }
    }
  }
}
