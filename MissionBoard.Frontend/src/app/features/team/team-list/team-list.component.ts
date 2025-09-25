import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Team } from '../team.model';
import * as TeamActions from '../team.actions';
import { selectAllTeams, selectTeamError } from '../team.selectors';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class TeamListComponent implements OnInit {
  teams$!: Observable<Team[]>;
  error$!: Observable<any>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.teams$ = this.store.select(selectAllTeams);
    this.error$ = this.store.select(selectTeamError);
    this.store.dispatch(TeamActions.loadTeams());
  }

  deleteTeam(id: number) {
    this.store.dispatch(TeamActions.deleteTeam({ id }));
  }
}
