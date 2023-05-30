import {Component} from '@angular/core';
import {Category, Difficulty, Question} from '../data.models';
import {Observable} from 'rxjs';
import {QuizService} from '../quiz.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-quiz-maker',
  templateUrl: './quiz-maker.component.html',
  styleUrls: ['./quiz-maker.component.css']
})
export class QuizMakerComponent {
  form!: FormGroup;

  showSubCategory: boolean = false;

  categories$: Observable<Category[]>;
  subCategories$?: Observable<Category[]>;
  questions$!: Observable<Question[]>;

  constructor(
    private fb: FormBuilder,
    protected quizService: QuizService
  ) {
    this.categories$ = quizService.getCategoriesGroups();
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      category: new FormControl(null, Validators.required),
      subCategory: new FormControl(),
      difficulty: new FormControl(null, Validators.required) 
    });

    this.form.get('category')?.valueChanges.subscribe(
      value=> {
        let cntrl = this.form.get('subCategory');
        if (value && this.quizService.isCategoryGroup(value)) {
          cntrl?.addValidators(Validators.required);
        } else {
          cntrl?.removeValidators(Validators.required);
        }
        cntrl?.updateValueAndValidity();
      }
    );
  }

  onCategoryChange() {
    let categoryId = this.form.get("category")?.value;
    let isSubCategory = this.quizService.isCategoryGroup(categoryId);
    if (isSubCategory) {
      this.form.get("subCategory")?.setValue(null);
      this.subCategories$ = this.quizService.getSubCategories(categoryId);
    }
    this.showSubCategory = isSubCategory;
  }

  createQuiz(): void {
    let categoryId = this.form.get("category")?.value;
    let difficulty = this.form.get("difficulty")?.value as Difficulty;
    if (this.quizService.isCategoryGroup(categoryId)) {
      categoryId = this.form.get("subCategory")?.value;
    }
    this.quizService.resetSession().finally(
      ()=>this.questions$ = this.quizService.createQuizSession(categoryId, difficulty)
    );
  }
}
