import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent, type ContentChange } from 'ngx-quill';

const BARRA = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ header: [2, 3, false] }],
  ['link'],
  ['clean'],
];

@Component({
  selector: 'app-editor-quill',
  standalone: true,
  imports: [FormsModule, QuillEditorComponent],
  template: `
    <quill-editor
      theme="snow"
      format="html"
      [placeholder]="placeholder()"
      [modules]="modulos"
      [ngModel]="html()"
      [ngModelOptions]="{ standalone: true }"
      [sanitize]="true"
      [compareValues]="true"
      trackChanges="user"
      [styles]="alto()"
      (onContentChanged)="onCambio($event)"
    />
  `,
  styles: `
    :host { display: block; min-width: 0; }
    :host ::ng-deep .ql-toolbar.ql-snow { border-radius: 11px 11px 0 0; background: #f8fafc; }
    :host ::ng-deep .ql-container.ql-snow { border-radius: 0 0 11px 11px; background: #fff; }
    :host ::ng-deep .ql-editor { line-height: 1.7; padding: 16px 18px; }
    :host ::ng-deep .ql-editor:focus-visible { outline: 2px solid var(--adm-brand); outline-offset: -2px; }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorQuill {
  readonly html = input('');
  readonly htmlChange = output<string>();
  readonly placeholder = input('Escriba aquí…');
  readonly compacto = input(false, { transform: booleanAttribute });

  readonly modulos = { toolbar: BARRA };
  readonly alto = computed(() => ({
    minHeight: this.compacto() ? '96px' : '160px',
  }));

  onCambio(evento: ContentChange): void {
    if (evento.source !== 'user') return;
    this.htmlChange.emit(evento.html ?? '');
  }
}
