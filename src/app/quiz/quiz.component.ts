import {Component, inject, Input} from '@angular/core';
import {Question} from '../data.models';
import {QuizService} from '../quiz.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent {

  @Input() set questions(questions: Question[] | null) {
    this._questions = questions;
    this.canChangeQuestions = true;
    this.message = undefined;
  }

  get questions(): Question[] | null {
    return this._questions;
  }

  canChangeQuestions: boolean = true;
  message?: string;

  private _questions: Question[] | null = [];
  private quizService = inject(QuizService);
  private router = inject(Router);

  questionTrackBy(index: number, question: Question) {
    return question.question;
  }

  onAnswerClicked(index: number, answer: string) {
    this.questions![index].user_answer = answer;
  }

  onChangeQuestionClicked(i: number) {
    this.quizService.getNewQuestionInSession().subscribe({
      next: question=> {
        if (question) {
          this.questions![i] = question;
        } else {
          this.message = "Sorry cannot change question";
        }
        this.canChangeQuestions = false;
      },
      error: err => {
        this.message = "Sorry cannot change question. An error is occurred. Retry later";
      }
    });
  }

  canShowSubmit(): boolean {
    return this.questions?!this.questions!.find(question=>question.user_answer == undefined):false;
  }

  submit(): void {
    this.quizService.computeScore(this.questions ?? []);
    this.quizService.resetSession().finally(()=>this.router.navigateByUrl("/result"));
  }

}
