import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, switchMap, tap} from 'rxjs';
import {Category, Difficulty, ApiQuestion, Question, Results, TokenResponse, ResetTokenResponse, ResponseCode} from './data.models';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private API_URL = "https://opentdb.com/";
  private latestResults!: Results;

  private catergoryGroupKeys: string[] = ['Entertainment:', 'Science:'];

  private categoryGroupsCache?: Category[];
  private subCategoryCache: Map<string, Category[]> = new Map();

  constructor(private http: HttpClient) {
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<{ trivia_categories: Category[] }>(this.API_URL + "api_category.php").pipe(
      map(res => res.trivia_categories)
    );
  }

  getCategoriesGroups(): Observable<Category[]> {
    let ret: Observable<Category[]>;
    if (this.categoryGroupsCache) {
      ret = of(this.categoryGroupsCache);
    } else {
      ret = this.getAllCategories().pipe(
        map((categories: Category[])=> {
          let categoyFilter: Map<number|string, Category> = new Map();
          categories.forEach(category=> {
            let categoryGroup: Category[] = [];
            this.catergoryGroupKeys.forEach(key=> {
              if (category.name.trim().startsWith(key)) {
                categoryGroup.push({id: key, name: key.replace(':', '')});
              }
            });
            if (categoryGroup.length>0) {
              categoyFilter.set(categoryGroup[0].id, categoryGroup[0]);
            } else {
              categoyFilter.set(category.id, category);
            }
          });
          this.categoryGroupsCache = Array.from(categoyFilter.values());
          return this.categoryGroupsCache;
        })
      );
    }
    return ret;
  }

  getSubCategories(key: string): Observable<Category[]> {
    let ret: Observable<Category[]>;
    if (this.subCategoryCache.has(key)) {
      ret = of(this.subCategoryCache.get(key)!);
    } else {
      return this.getAllCategories().pipe(
        map(categories=>{
          let subCat = categories.filter(category=>category.name.trim().startsWith(key));
          subCat.forEach(category=> category = this.normalizeSubCategoryName(key, category));
          this.subCategoryCache.set(key, subCat);
          return this.subCategoryCache.get(key)!;
        })
      );
    }
    return ret;
  }

  private normalizeSubCategoryName(catKey: string, category: Category): Category {
    category.name = category.name.substring(category.name.indexOf(catKey)+ catKey.length).trim();
    return category;
  }

  isCategoryGroup(id: string|number): boolean {
    let ret = false;
    if (typeof(id) === "string") {
      ret = true;
    }
    return ret;
  }

  private sessionToken?: string;
  private categoryId?: number;
  private difficulty?: Difficulty;
  private readonly DEFAULT_AMOUNT = 5;

  createQuiz(categoryId: number, difficulty: Difficulty, sessionToken?: string, amount: number = this.DEFAULT_AMOUNT): Observable<Question[]> {
    let tokenPar = "";
    if (sessionToken) {
      tokenPar = `&token=${sessionToken}`;
    }

    return this.http.get<{response_code: ResponseCode, results: ApiQuestion[] }>(
      `${this.API_URL}/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty.toLowerCase()}&type=multiple${tokenPar}`)
      .pipe(
        map(res => {
          if (res.response_code == 0) {
            const quiz: Question[] = res.results.map(q => (
              {...q, all_answers: [...q.incorrect_answers, q.correct_answer].sort(() => (Math.random() > 0.5) ? 1 : -1)}
            ));
            return quiz;
          } else {
            const emptyResult: Question[] = [];
            return emptyResult;
          }
        })
      );
  }

  createQuizSession(categoryId: number, difficulty: Difficulty): Observable<Question[]> {
    this.categoryId = categoryId;
    this.difficulty = difficulty;

    return this.http.get<TokenResponse>(`${this.API_URL}/api_token.php?command=request`).pipe(
      switchMap((response: TokenResponse)=> {
        this.sessionToken = response.token;
        return this.createQuiz(categoryId, difficulty, this.sessionToken);
      })
    );
  }

  getNewQuestionInSession(): Observable<Question|null> {
    if (this.sessionToken) {
      return this.createQuiz(this.categoryId!, this.difficulty!, this.sessionToken, 1).pipe(
        map(questions=>{
          const ret = questions.length>0?questions[0]:null;
          return ret;
        })
      );
    } else {
      throw new Error("This call need a session");
    }
  }

  resetSession(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject)=> {
      if (this.sessionToken) {
        this.http.get<ResetTokenResponse>(`${this.API_URL}/api_token.php?command=reset&token=${this.sessionToken}`).pipe(
          tap(this.sessionToken = undefined)
        ).subscribe({
          next: response => {
            resolve(true);
          },
          error: err=>reject()
        });
      } else {
        resolve(false);
      }
    });
  }

  computeScore(questions: Question[]): void {
    let score = 0;
    questions.forEach((q, index) => {
      if (q.correct_answer == q.user_answer)
        score++;
    })
    this.latestResults = {questions, score};
  }

  getLatestResults(): Results {
    return this.latestResults;
  }
}
