import { AfterContentInit, Component, ContentChildren, ElementRef, QueryList, Renderer2, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AutocompleteOptionComponent } from './autocomplete-option/autocomplete-option.component';
import { BehaviorSubject, Observable, distinctUntilChanged, filter, merge, mergeAll} from 'rxjs';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  exportAs: 'appAutocomplete'
})
export class AutocompleteComponent implements AfterContentInit {
  @ViewChild('optionsContainer', { read: ViewContainerRef }) private optionsContainer!: ViewContainerRef;
  @ViewChild('optionsTpl') private optionsTpl!: TemplateRef<void>;
  @ViewChild('dropdown') private dropdownEl!: ElementRef;
  @ContentChildren(AutocompleteOptionComponent) private optionsList?: QueryList<AutocompleteOptionComponent>;
  
  private isInitialized$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private renderer: Renderer2
  ) {}

  ngAfterContentInit(): void {
    this.isInitialized$.next(true);
  }

  getOptionsChanges(): Observable<any> | undefined {
    let ret: Observable<any> | undefined;
    if (this.optionsList && this.optionsList?.length>0) {
      let optionChanges: Observable<any>[] = [];
      this.optionsList?.forEach(option=> {
        optionChanges.push(option.selected$);
      });
      return merge(optionChanges).pipe(
        mergeAll(),
        distinctUntilChanged()
      );
    }
    return ret;
  }

  show() {
    this.optionsContainer.createEmbeddedView(this.optionsTpl);
  }

  hide() {
    this.optionsContainer.remove();
  }

  getOptionTextByValue(value: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.isInitialized$.pipe(filter(initialized=>initialized)).subscribe(()=>{
        let option = this.optionsList?.find(option=>value == option.value);
        resolve(option?option.getText():"");
      });
    });
  }

  filter(text: string) {
    if (text) {
      if (this.dropdownEl) {
        const search = text.toLowerCase().trim();
        let ctrVisible = 0;
        this.optionsList?.forEach(option=> {
          let isVisible = option.getText().toLowerCase().includes(search);
          option.setVisible(isVisible);
          if (isVisible) {
            ctrVisible++;
            option.highlightMatches(search);
          }
        });
        this.renderer.setStyle(this.dropdownEl.nativeElement, 'display', ctrVisible>0?'block':'none');
      }
    } else {
      this.optionsList?.forEach(option=> {
        option.clearMatches();
        option.setVisible(true);        
      });     
    }
  }

}
