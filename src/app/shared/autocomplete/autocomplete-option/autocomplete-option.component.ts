import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { Observable, fromEvent, map} from 'rxjs';

@Component({
  selector: 'app-autocomplete-option',
  templateUrl: './autocomplete-option.component.html',
  styleUrls: ['./autocomplete-option.component.css']
})
export class AutocompleteOptionComponent implements OnInit{
  @Input({required: true}) value: any;
  
  selected$!: Observable<any>;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.selected$ = fromEvent(this.el.nativeElement, 'click').pipe(
      map(event=> this.value)
    );
  }

  getText(): string {
    return this.el.nativeElement.innerText;
  }

  setVisible(flag: boolean) {
    this.renderer.setStyle(this.el.nativeElement, 'display', flag?'block':'none');
  }

  highlightMatches(chunk: string) {
    let text = this.getText();
    let rex = new RegExp(chunk, 'gi');
    let htmlContent = text.replace(rex, '<b>$&</b>');
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', htmlContent);  
  }

  clearMatches() {
    let text = this.getText();
    this.renderer.setProperty(this.el.nativeElement, 'innerText', text);  
  }

}
