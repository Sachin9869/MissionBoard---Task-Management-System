import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../user.model';
import * as UserActions from '../user.actions';
import { selectAllUsers, selectUserError } from '../user.selectors';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class UserListComponent implements OnInit {
  users$!: Observable<User[]>;
  error$!: Observable<any>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.users$ = this.store.select(selectAllUsers);
    this.error$ = this.store.select(selectUserError);
    this.store.dispatch(UserActions.loadUsers());
  }

  deleteUser(id: number) {
    this.store.dispatch(UserActions.deleteUser({ id }));
  }
}
