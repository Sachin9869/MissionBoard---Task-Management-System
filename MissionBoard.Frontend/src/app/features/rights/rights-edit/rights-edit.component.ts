import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as RightsActions from '../rights.actions';
import { Rights } from '../rights.model';

@Component({
  selector: 'app-rights-edit',
  templateUrl: './rights-edit.component.html',
  imports: [ReactiveFormsModule]
})
export class RightsEditComponent implements OnInit {
  @Input() rights: Rights | null = null;
  rightsForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store) {
    this.rightsForm = this.fb.group({
      id: [null],
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.rights) {
      this.rightsForm.patchValue(this.rights);
    }
  }

  onSubmit() {
    if (this.rightsForm.valid) {
      const rights: Rights = this.rightsForm.value;
      if (rights.id) {
        this.store.dispatch(RightsActions.updateRights({ rights }));
      } else {
        this.store.dispatch(RightsActions.addRights({ rights }));
      }
    }
  }
}
