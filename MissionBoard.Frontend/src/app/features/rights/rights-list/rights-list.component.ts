import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Rights } from '../rights.model';
import * as RightsActions from '../rights.actions';
import { selectAllRights, selectRightsError } from '../rights.selectors';

@Component({
  selector: 'app-rights-list',
  templateUrl: './rights-list.component.html',
  imports: [CommonModule]
})
export class RightsListComponent implements OnInit {
  rights$!: Observable<Rights[]>;
  error$!: Observable<any>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.rights$ = this.store.select(selectAllRights);
    this.error$ = this.store.select(selectRightsError);
    this.store.dispatch(RightsActions.loadRights());
  }

  deleteRights(id: number) {
    this.store.dispatch(RightsActions.deleteRights({ id }));
  }
}
