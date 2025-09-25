import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as TeamActions from '../team.actions';
import { Team } from '../team.model';

@Component({
  selector: 'app-team-edit',
  templateUrl: './team-edit.component.html',
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class TeamEditComponent implements OnInit {
  @Input() team: Team | null = null;
  teamForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store) {
    this.teamForm = this.fb.group({
      id: [null],
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.team) {
      this.teamForm.patchValue(this.team);
    }
  }

  onSubmit() {
    if (this.teamForm.valid) {
      const team: Team = this.teamForm.value;
      if (team.id) {
        this.store.dispatch(TeamActions.updateTeam({ team }));
      } else {
        this.store.dispatch(TeamActions.addTeam({ team }));
      }
    }
  }
}
