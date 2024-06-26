import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HeaderComponent } from './header/header.component';
import {environment} from '../environments/environment';
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HomeComponent } from './home/home.component';
import { AngularFireModule } from '@angular/fire/compat';
import { LogoutComponent } from './logout/logout.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    SignUpComponent,
    ForgetPasswordComponent,
    HomeComponent,
    LogoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CommonModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [
    provideAnimationsAsync(),
    importProvidersFrom([
      provideFirebaseApp(()=> initializeApp(environment.firebase)),
      provideAuth(()=> getAuth())
    ]),

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
