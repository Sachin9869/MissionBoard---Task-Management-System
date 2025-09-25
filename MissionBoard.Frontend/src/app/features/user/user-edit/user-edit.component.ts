import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as UserActions from '../user.actions';
import { User } from '../user.model';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class UserEditComponent implements OnInit {
  @Input() user: User | null = null;
  userForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store) {
    this.userForm = this.fb.group({
      id: [null],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      passwordHash: ['', Validators.required],
      teamId: [null]
    });
  }

  ngOnInit() {
    if (this.user) {
      this.userForm.patchValue(this.user);
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const user: User = this.userForm.value;
      if (user.id) {
        this.store.dispatch(UserActions.updateUser({ user }));
      } else {
        this.store.dispatch(UserActions.addUser({ user }));
      }
    }
  }
}
