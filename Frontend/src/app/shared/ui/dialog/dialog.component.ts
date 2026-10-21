import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, A11yModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-dark/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          (click)="onClose()"
        ></div>

        <!-- Dialog Box -->
        <div
          class="relative z-50 w-full max-w-2xl max-h-[90vh] rounded-2xl dialog-surface p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95 border dialog-border"
          [class.confirm-dialog]="effectiveVariant !== 'default'"
          [class.dialog-wide]="wide && effectiveVariant === 'default'"
          [class.confirm-danger]="effectiveVariant === 'danger' || effectiveVariant === 'logout'"
          [class.confirm-warning]="effectiveVariant === 'warning'"
          [class.confirm-success]="effectiveVariant === 'success'"
          role="dialog"
          cdkTrapFocus
          [cdkTrapFocusAutoCapture]="true"
          (keydown.escape)="onEscape($event)"
          aria-modal="true"
          [attr.aria-label]="title"
        >
          @if (effectiveVariant !== 'default') {
            <div class="confirm-symbol" aria-hidden="true">
              <i class="fa-solid" [class.fa-trash-can]="effectiveVariant === 'danger'" [class.fa-triangle-exclamation]="effectiveVariant === 'warning'" [class.fa-circle-check]="effectiveVariant === 'success'" [class.fa-right-from-bracket]="effectiveVariant === 'logout'"></i>
            </div>
          }
          <div class="flex items-center justify-between pb-4 mb-4 border-b dialog-border" [class.confirm-heading]="effectiveVariant !== 'default'">
            <h3 class="text-lg font-bold dialog-title">
              @if (effectiveVariant === 'default') {
                <span class="dialog-heading-icon" aria-hidden="true"><i class="fa-solid" [class]="headingIcon"></i></span>
              }
              <span>{{ title }}</span>
            </h3>
            <button
              type="button"
              (click)="onClose()"
              [disabled]="disableClose"
              class="rounded-lg p-1.5 dialog-close transition-colors"
              aria-label="Cerrar modal"
            >
              <i class="fa fa-times text-base"></i>
            </button>
          </div>

          <div class="py-2 text-sm dialog-content leading-relaxed">
            <ng-content></ng-content>
          </div>

          @if (showFooter) {
            <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t dialog-border">
              <ng-content select="[dialog-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .dialog-surface { background:var(--adm-surface,#fff); color:var(--adm-ink,#292d3b); border-color:var(--adm-line,#e2e8f0); }
    .dialog-surface {
      display:flex;
      flex-direction:column;
      overflow:hidden;
      min-height:0;
      box-shadow:0 20px 60px rgba(17,29,48,.18);
    }
    .dialog-surface > .dialog-content {
      flex:1 1 auto;
      min-height:0;
      overflow-y:auto;
      overflow-x:hidden;
      scrollbar-width:thin;
      padding-right:3px;
    }
    .dialog-surface > .dialog-content :is(p,a,span) { overflow-wrap:anywhere; }
    .dialog-surface > .dialog-content .save-bar { position:static; }
    .dialog-surface > .dialog-content .form-grid { min-width:0; }
    @media(max-width:600px) {
      .dialog-surface { padding:16px; max-height:94vh; }
    }

    /* Cabecera y contenido coherentes en los diálogos administrativos. */
    .dialog-wide { max-width:min(960px,calc(100vw - 32px)); }
    .dialog-title { display:flex; align-items:center; gap:12px; min-width:0; }
    .dialog-heading-icon {
      display:inline-flex; align-items:center; justify-content:center;
      flex:0 0 42px; width:42px; height:42px;
      border:1px solid color-mix(in srgb,var(--adm-brand,#218fca) 35%,var(--adm-line,#e2e8f0));
      border-radius:12px;
      background:color-mix(in srgb,var(--adm-brand,#218fca) 9%,var(--adm-surface,#fff));
      color:var(--adm-brand,#218fca); font-size:1rem;
    }
    .dialog-surface > .dialog-content { scrollbar-color:var(--adm-line,#cbd5e1) transparent; }
    .dialog-surface > .dialog-content :is(a,button) { overflow-wrap:normal; }
    .dialog-close { flex:0 0 auto; width:34px; height:34px; display:grid; place-items:center; }
    @media(max-width:600px) {
      .dialog-heading-icon { flex-basis:38px; width:38px; height:38px; }
      .dialog-title { gap:9px; }
    }
    .dialog-border { border-color:var(--adm-line,#e2e8f0); }
    .dialog-title { color:var(--adm-ink,#292d3b); }
    .dialog-content { color:var(--adm-muted,#526174); }
    .dialog-close { color:var(--adm-ink-soft,#64748b); }
    .dialog-close:hover { color:var(--adm-ink,#292d3b); background:var(--adm-muted-bg,#edf2f7); }
    .dialog-surface .form-row label { color:var(--adm-ink,#292d3b); }
    .dialog-surface .form-row :is(input,textarea,select) {
      background:var(--adm-bg,#f7f6f8);
      color:var(--adm-ink,#292d3b);
      border-color:var(--adm-line,#e2e8f0);
    }
    .dialog-surface .form-row :is(input,textarea)::placeholder { color:var(--adm-muted,#526174); }
    .dialog-surface .ql-toolbar.ql-snow { background:var(--adm-bg,#f7f6f8); border-color:var(--adm-line,#e2e8f0); }
    .dialog-surface .ql-container.ql-snow,.dialog-surface .ql-editor { background:var(--adm-surface,#fff); color:var(--adm-ink,#292d3b); border-color:var(--adm-line,#e2e8f0); }
    .dialog-surface .ql-editor.ql-blank::before { color:var(--adm-muted,#526174); }
    .dialog-surface .ql-toolbar .ql-picker-label { color:var(--adm-ink,#292d3b); }
    .dialog-surface .ql-toolbar .ql-stroke { stroke:var(--adm-ink-soft,#64748b); }
    .dialog-surface .ql-toolbar .ql-fill { fill:var(--adm-ink-soft,#64748b); }
    :host-context(.admin-shell[data-modo="oscuro"]) .confirm-dialog {
      background:linear-gradient(155deg,var(--adm-brand-soft),var(--adm-surface) 43%);
      border-color:var(--adm-line);
    }
    :host-context(.admin-shell[data-modo="oscuro"]) .confirm-heading h3 { color:var(--adm-ink); }
    :host-context(.admin-shell[data-modo="oscuro"]) .confirm-dialog > div:nth-last-child(2) { color:var(--adm-muted); }
    :host-context(.admin-shell[data-modo="oscuro"]) .confirm-dialog > div:last-child { background:var(--adm-bg); border-color:var(--adm-line); }
    :host-context(.admin-shell[data-modo="oscuro"]) .confirm-heading button { background:var(--adm-muted-bg); color:var(--adm-ink); border-color:var(--adm-line); }
    :host-context(.admin-shell[data-modo="oscuro"]) .confirm-dialog .dialog-content { color:var(--adm-muted); }
    :host-context(.admin-shell[data-modo="oscuro"]) .confirm-dialog .confirm-symbol {
      background:color-mix(in srgb,var(--confirm-color) 14%,var(--adm-surface));
      border-color:color-mix(in srgb,var(--confirm-color) 28%,var(--adm-line));
    }
    /* Confirmaciones compactas y consistentes en todos los módulos del administrador. */
    .confirm-dialog {
      --confirm-color:var(--adm-danger,#dc3545);
      width:min(100%,440px);
      max-width:440px;
      padding:26px;
      border:1px solid var(--adm-line,#dbe4ef);
      border-radius:16px;
      background:var(--adm-surface,#fff);
      text-align:left;
      box-shadow:0 24px 70px rgba(12,33,62,.22);
      gap:0;
    }
    .confirm-warning { --confirm-color:var(--adm-warn,#c88616); }
    .confirm-success { --confirm-color:var(--adm-ok,#21874e); }
    .confirm-symbol {
      width:46px;height:46px;margin:0 0 14px;
      display:grid;place-items:center;
      border:1px solid color-mix(in srgb,var(--confirm-color) 22%,var(--adm-line,#e2e8f0));
      border-radius:12px;
      background:color-mix(in srgb,var(--confirm-color) 9%,var(--adm-surface,#fff));
      color:var(--confirm-color);font-size:1.15rem;
    }
    .confirm-heading { justify-content:flex-start; border:0; padding:0; margin:0 0 5px; }
    .confirm-heading h3 { flex:1; text-align:left; font-size:1.15rem; line-height:1.35; color:var(--adm-ink,#14202c); }
    .confirm-heading button {
      position:absolute;right:18px;top:18px;
      border:1px solid var(--adm-line,#dbe4ef);
      background:var(--adm-surface,#fff);
      color:var(--adm-muted,#64748b);
      width:32px;height:32px;
    }
    .confirm-dialog > .dialog-content {
      color:var(--adm-muted,#61758a);
      font-size:.92rem;line-height:1.55;
      padding:0 0 8px;
      text-align:left;
    }
    .confirm-dialog > div:last-child {
      margin:16px 0 0;padding:16px 0 0;
      border-top:1px solid var(--adm-line,#e2e8f0);
      background:transparent;
      gap:10px;
    }
    .confirm-dialog > div:last-child button {
      flex:1;min-height:44px;border-radius:10px;
      font-weight:650;
    }
    .confirm-dialog button:focus-visible { outline:2px solid var(--adm-brand,#1264b2);outline-offset:2px; }
    @media(max-width:540px) {
      .confirm-dialog {padding:22px 18px;max-width:calc(100vw - 28px)}
      .confirm-heading button {right:14px;top:14px}
      .confirm-dialog > div:last-child {margin:14px 0 0;padding:14px 0 0;flex-wrap:wrap}
    }
    @media(prefers-reduced-motion: reduce) { .confirm-dialog { animation: none; transition: none; } }
  `,
})
export class DialogComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Input() wide = false;
  @Input() disableClose = false;
  get headingIcon(): string {
    const t=this.title.toLocaleLowerCase('es');
    if (/solicitud|trámite|expediente/.test(t)) return 'fa-file-circle-check';
    if (/usuario|cuenta|perfil/.test(t)) return 'fa-user-gear';
    if (/documento|archivo/.test(t)) return 'fa-file-lines';
    if (/noticia|comunicado/.test(t)) return 'fa-newspaper';
    if (/imagen|galería|foto/.test(t)) return 'fa-images';
    if (/programa|estudio/.test(t)) return 'fa-graduation-cap';
    return 'fa-pen-to-square';
  }
  @Input() variant: 'default' | 'danger' | 'warning' | 'success' | 'logout' = 'default';
  /** Confirmaciones antiguas sin variante explícita conservan el estilo moderno. */
  get effectiveVariant(): 'default' | 'danger' | 'warning' | 'success' | 'logout' {
    if (this.variant !== 'default') return this.variant;
    const title = this.title.trim().toLocaleLowerCase('es');
    if (/^(eliminar|borrar|quitar|suprimir|descartar)\b/.test(title)) return 'danger';
    if (/^(restaurar|restablecer|reponer|reiniciar)\b/.test(title)) return 'warning';
    if (/^cerrar sesi[oó]n\b/.test(title)) return 'logout';
    return 'default';
  }

  @Output() openChange = new EventEmitter<boolean>();

  onEscape(event: Event): void {
    event.stopPropagation();
    if (!this.disableClose) this.onClose();
  }

  onClose() {
    if (this.disableClose) return;
    this.open = false;
    this.openChange.emit(false);
  }
}
