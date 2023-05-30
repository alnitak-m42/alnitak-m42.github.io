import { Component, OnDestroy} from '@angular/core';
import { LoadingService } from './loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  isLoading: boolean = false;
  private subscription!: Subscription;

  constructor(
    private loadingService: LoadingService,
  ) {
    this.subscription = this.loadingService.isLoading$.subscribe(isLoading=> {
      setTimeout(()=>{this.isLoading = isLoading;});
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


}
