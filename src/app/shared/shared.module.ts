import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { AutocompleteOptionComponent } from './autocomplete/autocomplete-option/autocomplete-option.component';
import { AutocompleteDirective } from './autocomplete/directives/autocomplete.directive';



@NgModule({
  declarations: [
    AutocompleteComponent,
    AutocompleteOptionComponent,
    AutocompleteDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AutocompleteComponent,
    AutocompleteOptionComponent,
    AutocompleteDirective
  ]
})
export class SharedModule { }
