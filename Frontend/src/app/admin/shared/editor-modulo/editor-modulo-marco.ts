import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogComponent } from '../../../shared/ui';
import { AvisoCambios } from '../aviso-cambios/aviso-cambios';
import type { EditorModuloVista } from './editor-modulo-base';

export interface MarcoTab {
  id: string;
  label: string;
}

/**
 * Marco visual de un editor de módulo a medida: cabecera, pestañas, barra de
 * guardado con feedback, aviso de salida y diálogo de confirmación. El cuerpo
 * de la pestaña activa va proyectado. Toda la lógica vive en `editor`
 * (una instancia de `EditorModuloBase`).
 */
@Component({
  selector: 'app-editor-modulo-marco',
  standalone: true,
  imports: [RouterLink, AvisoCambios, DialogComponent],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ titulo() }}</h1>
          <p class="page-sub">{{ sub() }}</p>
        </div>
        <div class="page-header-actions">
          @if (editor().modificado()) {
            <span class="badge badge-modificado">Con cambios publicados</span>
          }
          <a class="btn-ghost" [routerLink]="publicPath()" target="_blank" rel="noopener">
            <i class="fa fa-arrow-up-right-from-square" aria-hidden="true"></i> Ver página pública
          </a>
          <button
            type="button"
            class="btn-ghost"
            (click)="editor().restaurar()"
            [disabled]="editor().restaurando()"
          >
            {{ editor().restaurando() ? 'Restaurando…' : 'Restaurar original' }}
          </button>
        </div>
      </header>

      <nav class="admin-tabs" role="tablist" [attr.aria-label]="'Secciones de ' + titulo()">
        @for (tab of tabs(); track tab.id) {
          <button
            type="button"
            role="tab"
            class="admin-tab"
            [attr.id]="'portal-tab-' + tab.id"
            [attr.aria-controls]="'portal-panel-' + tab.id"
            [attr.aria-selected]="activa() === tab.id"
            [class.active]="activa() === tab.id"
            [attr.aria-current]="activa() === tab.id ? 'true' : null"
            (click)="activa.set(tab.id)"
          >
            {{ tab.label }}
          </button>
        }
      </nav>

      <div class="marco-lienzo" role="tabpanel" [attr.id]="'portal-panel-' + activa()" [attr.aria-labelledby]="'portal-tab-' + activa()">
        <ng-content />
      </div>

      <div class="marco-extra">
        <ng-content select="[extra]" />
      </div>

      <div class="save-bar">
        @if (editor().guardado() && !editor().dirty()) {
          <span class="save-ok" role="status">
            <i class="fa fa-circle-check" aria-hidden="true"></i> Cambios publicados
          </span>
        }
        <button
          type="button"
          class="btn-cancel"
          (click)="editor().cancelar()"
          [disabled]="!editor().dirty()"
        >
          Descartar cambios
        </button>
        <button
          type="button"
          class="btn-save"
          (click)="editor().guardar()"
          [disabled]="!editor().dirty() || editor().guardando()"
        >
          @if (editor().guardando()) {
            <i class="fa fa-spinner fa-spin" aria-hidden="true"></i> Guardando…
          } @else {
            <i class="fa fa-cloud-arrow-up" aria-hidden="true"></i> Guardar cambios
          }
        </button>
      </div>
    </div>

    <app-aviso-cambios
      [abierto]="editor().aviso()"
      (guardar)="editor().onGuardarAviso()"
      (descartar)="editor().onDescartarAviso()"
      (seguir)="editor().onSeguirAviso()"
    />

    <app-dialog
      [open]="!!editor().confirmacion()"
      [title]="editor().confirmacion()?.titulo ?? ''"
      (openChange)="$event || editor().cancelarConfirmacion()"
    >
      <p>{{ editor().confirmacion()?.detalle }}</p>
      <div dialog-footer>
        <button type="button" class="btn-cancel" (click)="editor().cancelarConfirmacion()">
          Cancelar
        </button>
        <button type="button" class="btn-danger" (click)="editor().ejecutarConfirmacion()">
          Sí, eliminar
        </button>
      </div>
    </app-dialog>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-header {
      align-items: center;
      padding: 26px 34px;
      border: 1px solid #f1dfd2;
      border-radius: 18px;
      background: linear-gradient(115deg, #fff8f2, #fff 70%);
      box-shadow: 0 4px 20px rgba(42, 52, 72, .03);
    }
    .page-header .page-title { font-size: clamp(1.5rem, 2.3vw, 2rem); letter-spacing: -.025em; }
    .page-header .page-sub { max-width: 75ch; font-size: .94rem; line-height: 1.6; }
    .page-header-actions { gap: 10px; }
    @media (max-width: 720px) { .page-header { padding: 20px; } .page-header-actions { width: 100%; } }

    .marco-lienzo {
      min-width: 0;
      padding: 24px;
      border: 1px solid var(--adm-line);
      border-radius: var(--adm-radius);
      background: linear-gradient(180deg, #fffaf6 0, var(--adm-bg) 130px);
      box-shadow: var(--adm-shadow);
    }

    .marco-extra:not(:empty) {
      margin-top: 22px;
    }

    .admin-tabs { scroll-padding-inline: 12px; }
    .admin-tab[aria-selected="true"] { color: var(--adm-brand); }
    .marco-lienzo :focus-visible { outline-color: var(--adm-brand); }
    .page-header-actions .fa {
      font-size: 0.72rem;
    }

    .save-bar {
      align-items: center;
    }

    .save-ok {
      margin-right: auto;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: var(--adm-ok);
      font-size: 0.83rem;
      font-weight: 600;
    }

    .btn-save .fa,
    .btn-danger .fa {
      font-size: 0.8rem;
    }

    @media (max-width: 620px) {
      .marco-lienzo {
        padding: 16px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorModuloMarco {
  readonly editor = input.required<EditorModuloVista>();
  readonly titulo = input.required<string>();
  readonly sub = input.required<string>();
  readonly publicPath = input.required<string>();
  readonly tabs = input.required<readonly MarcoTab[]>();
  readonly activa = model.required<string>();
}
