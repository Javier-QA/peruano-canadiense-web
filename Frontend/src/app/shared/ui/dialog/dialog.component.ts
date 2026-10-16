import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
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
          class="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95 border border-[#E2E1EC]"
          [class.confirm-dialog]="variant !== 'default'"
          [class.confirm-danger]="variant === 'danger' || variant === 'logout'"
          [class.confirm-warning]="variant === 'warning'"
          [class.confirm-success]="variant === 'success'"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title"
        >
          @if (variant !== 'default') {
            <div class="confirm-symbol" aria-hidden="true">
              <i class="fa-solid" [class.fa-trash-can]="variant === 'danger'" [class.fa-triangle-exclamation]="variant === 'warning'" [class.fa-circle-check]="variant === 'success'" [class.fa-right-from-bracket]="variant === 'logout'"></i>
            </div>
          }
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E1EC]" [class.confirm-heading]="variant !== 'default'">
            <h3 class="text-lg font-bold text-dark">{{ title }}</h3>
            <button
              type="button"
              (click)="onClose()"
              class="rounded-lg p-1.5 text-muted hover:bg-secondary hover:text-dark transition-colors"
              aria-label="Cerrar modal"
            >
              <i class="fa fa-times text-base"></i>
            </button>
          </div>

          <div class="py-2 text-sm text-[#6C6A74] leading-relaxed">
            <ng-content></ng-content>
          </div>

          @if (showFooter) {
            <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E2E1EC]">
              <ng-content select="[dialog-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .confirm-dialog { --confirm-color: #e1282d; --confirm-tint: #ffe7e9; position: relative; max-width: 550px; padding: 32px 25px 0; border: 1px solid #cfdae5; border-top: 4px solid var(--confirm-color); border-radius: 20px; background: linear-gradient(155deg, var(--confirm-tint), #f2f5f9 43%); text-align: center; box-shadow: 0 22px 65px rgba(17, 29, 48, .26); }
    .confirm-warning { --confirm-color: #d68a14; --confirm-tint: #fff2d9; }
    .confirm-success { --confirm-color: #21874e; --confirm-tint: #e5f6ea; }
    .confirm-symbol { width: 82px; height: 82px; margin: 0 auto 12px; display: grid; place-items: center; border: 5px solid color-mix(in srgb, var(--confirm-color) 16%, transparent); border-radius: 26px; background: color-mix(in srgb, var(--confirm-color) 12%, white); color: var(--confirm-color); font-size: 1.8rem; }
    .confirm-heading { justify-content: center; border: 0; padding: 0; margin: 0 0 12px; }
    .confirm-heading h3 { flex: 1; text-align: center; font-size: 1.35rem; color: #14202c; }
    .confirm-heading button { position: absolute; right: 14px; top: 14px; border: 1px solid #b5c9db; background: #edf3f9; color: #58748f; width: 38px; height: 38px; }
    .confirm-dialog > div:nth-last-child(2) { color: #617a94; font-size: 1rem; }
    .confirm-dialog > div:last-child { margin: 18px -25px 0; padding: 20px 24px 24px; border-top: 1px solid #bacbdc; background: rgba(229, 237, 245, .45); }
    .confirm-dialog > div:last-child button { flex: 1; min-height: 46px; border-radius: 12px; }
    .confirm-dialog button:focus-visible { outline: 2px solid var(--confirm-color); outline-offset: 2px; }
    @media(max-width: 540px) { .confirm-dialog { padding: 25px 16px 0; } .confirm-dialog > div:last-child { margin-inline: -16px; padding: 15px; flex-wrap: wrap; } }
    @media(prefers-reduced-motion: reduce) { .confirm-dialog { animation: none; transition: none; } }
  `,
})
export class DialogComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Input() variant: 'default' | 'danger' | 'warning' | 'success' | 'logout' = 'default';
  @Output() openChange = new EventEmitter<boolean>();

  onClose() {
    this.open = false;
    this.openChange.emit(false);
  }
}
