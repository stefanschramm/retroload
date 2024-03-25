import {InternalError} from '../../common/Exceptions.js';
import {type Position} from '../../common/Positioning.js';

export type Annotation = {
  label: string;
  begin: Position;
  end?: Position;
  annotations: Annotation[];
};

export class AnnotationCollector {
  private readonly annotationStack: Annotation[] = [];
  private readonly annotations: Annotation[] = [];

  public beginAnnotation(label: string, position: Position) {
    const parentAnnotation = this.getParentAnnotation();
    if (parentAnnotation !== undefined && (position.samples < parentAnnotation.begin.samples || position.seconds < parentAnnotation.begin.seconds)) {
      throw new InternalError('Begin of pushed annotation is before parent annotation.');
    }
    const previousAnnotation = this.getPreviousAnnotationInSameLevel();
    if (previousAnnotation?.end !== undefined && (previousAnnotation.end.samples > position.samples || previousAnnotation.end.seconds > position.seconds)) {
      throw new InternalError('Begin of pushed annotation is before previous annotation.');
    }
    this.annotationStack.push({label, begin: position, annotations: []});
  }

  public endAnnotation(position: Position) {
    const annotation = this.annotationStack.pop();
    if (annotation === undefined) {
      throw new InternalError('Unable to end annotation. No annotation has been opened.');
    }
    if (annotation.begin.samples > position.samples || annotation.begin.seconds > position.seconds) {
      throw new InternalError('End of annotation is before begin.');
    }
    const closedAnnotation = {
      ...annotation,
      end: position,
    };

    this.getCurrentAnnotationList().push(closedAnnotation);
  }

  public getAnnotations(): Annotation[] {
    return this.annotations;
  }

  private getParentAnnotation(): Annotation | undefined {
    if (this.annotationStack.length === 0) {
      return undefined;
    }

    return this.annotationStack[this.annotationStack.length - 1];
  }

  private getCurrentAnnotationList(): Annotation[] {
    const parentAnnotation = this.getParentAnnotation();

    return parentAnnotation ? parentAnnotation.annotations : this.annotations;
  }

  private getPreviousAnnotationInSameLevel(): Annotation | undefined {
    const currentList = this.getCurrentAnnotationList();
    if (currentList.length === 0) {
      return undefined;
    }

    return currentList[currentList.length - 1];
  }
}
