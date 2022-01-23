import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { GlobalErrorHandler } from './shared/services/error.global.handler';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    // DebounceClickDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    // ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    CoreModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    Location, {provide: LocationStrategy, useClass: PathLocationStrategy} // 22012022 eliminar el #
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
