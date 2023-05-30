import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Question} from '../data.models';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent {
  @Input({required: true}) question!: Question;
  @Input() correctAnswer?: string;
  @Input() userAnswer?: string;
  @Input() canChangeQuestion: boolean = true;

  @Output() change = new EventEmitter<string>();
  @Output() changeQuestion = new EventEmitter<Question>();

  getButtonClass(answer: string): string {
    if (! this.userAnswer) {
        if (this.currentSelection == answer)
          return "tertiary";
    } else {
      if (this.userAnswer == this.correctAnswer && this.userAnswer == answer)
        return "tertiary";
      if (answer == this.correctAnswer)
        return "secondary";
    }
    return "primary";
  }


  currentSelection!: string;

  buttonClicked(answer: string): void {
    this.currentSelection = answer;
    this.change.emit(answer);
  }

  changeQuestionClicked(): void {
    this.changeQuestion.emit(this.question);
  }
}
