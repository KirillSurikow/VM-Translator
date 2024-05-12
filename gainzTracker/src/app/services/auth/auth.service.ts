import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { DbService } from '../db/db.service';
import { signOut, getAuth, sendPasswordResetEmail } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private db: DbService) {}
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);

  register(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    )
      .then((response) => {
        const uid = response.user.uid;
        updateProfile(response.user, { displayName: username });
        this.db.setUserInDB(uid, email, username, firstName, lastName);
      })
      .catch((error) => {
        console.log(error);
      });
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {});

    return from(promise);
  }

  logout() : Observable <void> {
    const promise = signOut(this.firebaseAuth)
    return from(promise);
  }

  private auth = getAuth()
  async resetPassword(email: string): Promise<any> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return 'success';
    } catch (error) {
      console.log(error)
      return error;
    }
  }

}
