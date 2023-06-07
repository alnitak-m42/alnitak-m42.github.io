import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, Renderer2 } from '@angular/core';
import { AutocompleteComponent } from '../autocomplete.component';
import { Subject, debounceTime, distinctUntilChanged, fromEvent, map, takeUntil} from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[appAutocomplete]',
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: AutocompleteDirective}
  ]
})
export class AutocompleteDirective implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input({required: true}) appAutocomplete!: AutocompleteComponent;
  @Output() change: EventEmitter<any> = new EventEmitter();

  private onDestroy$: Subject<void> = new Subject();
  private onDropDownClosed$: Subject<void> = new Subject();
  private onChange = (value:any) => {};
  private onTouched = () => {};
  private touched = false;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
  ) { 
    renderer.setStyle(el.nativeElement, 'padding-bottom', 0);
    renderer.setStyle(el.nativeElement, 'margin-bottom', 0);
  }

  ngAfterViewInit(): void {
    this.attachKeyUpEvents();
    this.writeValue(this.el.nativeElement.value);
  }

  ngOnDestroy(): void {
    this.onDropDownClosed$.complete();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  @HostListener('focus') 
  private onFocus() {
    let optionsEvents$ = this.appAutocomplete.getOptionsChanges();
    if (optionsEvents$) {
      this.showDropdown();

      optionsEvents$.pipe(
        takeUntil(this.onDropDownClosed$)
      ).subscribe(value=> {
        this.setHostValueByOptionValue(value);
        this.notifyValue(value);
        this.hideDropdown();
      });
    }
  }

  @HostListener('blur') 
  private onBlur() {
    setTimeout(()=>this.hideDropdown(), 300);
  }

  private attachKeyUpEvents() {
    fromEvent(this.el.nativeElement, 'keyup').pipe(
      takeUntil(this.onDestroy$),
      debounceTime(200),  
      distinctUntilChanged(),
      map((event: any) => event.target.value),
    ).subscribe(text=> {
      this.notifyValue(null);
      this.appAutocomplete.filter(text);
    });
  }

  writeValue(value: any): void {
    this.setHostValueByOptionValue(value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  private showDropdown() {
    this.appAutocomplete.show();
  }

  private hideDropdown() {
    this.appAutocomplete.hide();
    this.onDropDownClosed$.next();
  }

  private setHostValueByOptionValue(value: any) {
    this.appAutocomplete.getOptionTextByValue(value).then((text:string)=> {
      this.renderer.setProperty(this.el.nativeElement, 'value', text);
    });
  }

  private notifyValue(value: any) {
    this.onChange(value);
    this.change.emit(value);
    this.markAsTouched();
  }
}

