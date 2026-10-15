import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MODULO_META } from '../../core/models/documento.model';
import { NewsService } from '../../core/services/news.service';
import { ArchivosStore } from '../../core/store/archivos.store';
import { ContenidoStore } from '../../core/store/contenido.store';
import { DocumentosStore } from '../../core/store/documentos.store';
import { FacultyStore } from '../../core/store/faculty.store';
import { DialogComponent } from '../../shared/ui';
import { ToastService } from '../shared/toast/toast';

@Component({
  selector: 'app-admin-contenido',
  standalone: true,
  imports: [RouterLink, DialogComponent],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="portal-header-identity">
          <div class="portal-header-copy">
            <h1 class="page-title"><i class="fa-solid fa-layer-group portal-title-icon" aria-hidden="true"></i>Contenido del portal</h1>
            <p class="page-sub">
            Administra las páginas, documentos y secciones visibles en el portal institucional.
          </p>
          </div>
        </div>
        <button type="button" class="btn-ghost" (click)="confirmar.set(true)">
          Restaurar todo
        </button>
      </header>

      <section class="catalogo-panel" aria-labelledby="catalogo-title">
        <div class="catalogo-heading">
          <div>
            <h2 id="catalogo-title">Secciones del portal</h2>
            <p>Selecciona una sección para administrar su contenido.</p>
          </div>
          <span class="catalogo-total">{{ filas().length }} secciones</span>
        </div>
        <div class="modulo-grid" aria-label="Módulos del portal público">
          @for (mod of filas(); track mod.id) {
            <a class="modulo-tile" [routerLink]="mod.adminPath" [attr.aria-label]="'Editar ' + mod.titulo">
              <span class="modulo-icon"><i class="fa-solid {{ mod.icon }}" aria-hidden="true"></i></span>
              <div class="modulo-info">
                <h3 class="modulo-name">{{ mod.titulo }}</h3>
                <p class="modulo-counts">
                  <span>{{ mod.publicados }} publicados</span>
                  <span class="count-divider" aria-hidden="true">·</span>
                  <span>{{ mod.borradores }} borradores</span>
                </p>
              </div>
              @if (mod.modificado) {
                <span class="modulo-status">Modificado</span>
              }
              <i class="fa-solid fa-chevron-right modulo-arrow" aria-hidden="true"></i>
            </a>
          }
        </div>
      </section>
    </div>

    <app-dialog
      [open]="confirmar()"
      title="Restaurar todo el contenido"
      (openChange)="confirmar.set($event)"
    >
      @if (remoto) {
        <p>
          Los módulos de contenido y sus documentos vuelven al contenido oficial en el servidor,
          para todos los visitantes. Es inmediato y no se puede deshacer.
        </p>
        <p class="form-hint">
          Las noticias, el directorio de personal y el repositorio no se tocan: se gestionan en su
          propia pantalla.
        </p>
      } @else {
        <p>
          Se borran los cambios de los módulos de contenido, el directorio, las noticias, los
          documentos subidos y los archivos de este navegador. El portal vuelve a las constantes
          originales.
        </p>
      }
      <div dialog-footer>
        <button type="button" class="btn-cancel" (click)="confirmar.set(false)">Cancelar</button>
        <button
          type="button"
          class="btn-danger"
          [disabled]="restaurando()"
          (click)="restaurarTodo()"
        >
          {{ restaurando() ? 'Restaurando…' : 'Restaurar todo' }}
        </button>
      </div>
    </app-dialog>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .admin-page { display: flex; flex-direction: column; gap: 22px; }
    .page-header {
      padding: 14px 22px; border: 1px solid #f1dfd2;
      border-radius: 16px; background: linear-gradient(115deg, #fff8f2, #fff 70%);
    }
    .page-header { align-items: center; padding: 14px 20px; border-radius: 16px; }
    .portal-header-identity { display: flex; align-items: center; flex: 1 1 auto; min-width: 0; }
    .portal-header-copy { min-width: 0; }
    .portal-title-icon { display: inline-block; margin-right: 10px; color: var(--adm-brand); font-size: .72em; vertical-align: .08em; }
    .portal-header-copy .page-title { display: flex; align-items: center; gap: 0; margin: 0 0 3px; line-height: 1.22; }
    .portal-header-copy .page-sub { margin: 0; }
    @media (max-width: 600px) { .portal-title-icon { margin-right: 8px; } }
    .page-header .page-title { font-size: clamp(1.4rem, 2vw, 1.75rem); }
    .page-header .page-sub { font-size: .85rem; }
    @media (max-width: 720px) { .page-header { padding: 20px; } }
    .page-header .page-sub { max-width: 68ch; line-height: 1.6; }
    .catalogo-panel {
      min-width: 0;
      background: var(--adm-surface, #fff);
      border: 1px solid var(--adm-line, #dfe5ee);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(27, 41, 61, .035);
    }
    .catalogo-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 19px 24px;
      border-bottom: 1px solid var(--adm-line, #e5e9f0);
    }
    .catalogo-heading h2 { margin: 0 0 3px; font-size: 1.08rem; font-weight: 750; color: var(--adm-ink); }
    .catalogo-heading p { margin: 0; font-size: .82rem; color: var(--adm-muted); }
    .catalogo-total { color: var(--adm-muted); font-size: .78rem; white-space: nowrap; }
    .modulo-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0;
    }
    .modulo-grid > .modulo-tile,
    .modulo-grid > .modulo-tile + .modulo-tile {
      margin: 0;
    }
    .modulo-tile {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
      min-height: 88px;
      padding: 15px 22px;
      background: transparent;
      border: 0;
      border-bottom: 1px solid var(--adm-line, #e5e9f0);
      color: inherit;
      text-decoration: none;
      transition: background .16s ease;
    }
    .modulo-tile:nth-child(odd) { border-right: 1px solid var(--adm-line, #e5e9f0); }
    .modulo-icon {
      display: inline-flex;
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: #fff3e9;
      color: var(--adm-brand);
      font-size: .95rem;
    }
    .modulo-info { flex: 1 1 auto; min-width: 0; }
    .modulo-name { margin: 0 0 5px; font-size: .94rem; line-height: 1.3; font-weight: 750; color: var(--adm-ink); }
    .modulo-counts { display: flex; flex-wrap: wrap; align-items: center; gap: 3px 7px; margin: 0; font-size: .76rem; line-height: 1.4; color: var(--adm-muted); }
    .count-divider { color: #aab4c2; }
    .modulo-status {
      flex: 0 0 auto;
      padding: 5px 9px;
      border: 1px solid #f4d8c5;
      border-radius: 7px;
      background: #fff7f0;
      color: #b64c0b;
      font-size: .71rem;
      font-weight: 650;
      white-space: nowrap;
    }
    .modulo-arrow { flex: 0 0 auto; margin-left: 4px; color: #a1adbc; font-size: .75rem; }
    .modulo-tile:hover { background: #fffaf6; }
    .modulo-tile:hover .modulo-arrow { color: var(--adm-brand); }
    .modulo-tile:focus-visible { outline: 2px solid var(--adm-brand); outline-offset: -3px; }
    @media (max-width: 900px) {
      .modulo-grid { grid-template-columns: 1fr; }
      .modulo-tile:nth-child(odd) { border-right: 0; }
    }
    @media (max-width: 600px) {
      .catalogo-heading { padding: 16px; align-items: flex-start; }
      .modulo-tile { padding: 13px 14px; gap: 10px; }
      .modulo-icon { width: 36px; height: 36px; flex-basis: 36px; }
      .modulo-status { font-size: .66rem; padding: 4px 6px; }
      .page-header { padding: 16px; }
    }
    @media (prefers-reduced-motion: reduce) { .modulo-tile { transition: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContenido {
  private readonly contenido = inject(ContenidoStore);
  private readonly documentos = inject(DocumentosStore);
  private readonly archivos = inject(ArchivosStore);
  private readonly personal = inject(FacultyStore);
  private readonly noticias = inject(NewsService);
  private readonly toast = inject(ToastService);

  readonly confirmar = signal(false);
  readonly remoto = environment.useRemoteApi;
  readonly restaurando = signal(false);

  readonly filas = computed(() =>
    MODULO_META.map((mod) => {
      const conteo = this.documentos.conteo(mod.id);
      return {
        ...mod,
        modificado: this.contenido.de(mod.id).modificado(),
        publicados: conteo.publicados,
        borradores: conteo.borradores,
      };
    }),
  );

  /**
   * Con backend, restaurar significa pedirle al servidor que reponga el copy y
   * los documentos oficiales: limpiar el navegador dejaría el cambio vivo para
   * el resto del mundo. Sin backend se limpia el almacenamiento local.
   */
  async restaurarTodo(): Promise<void> {
    this.restaurando.set(true);
    try {
      await this.contenido.resetAll();
      if (this.remoto) {
        for (const mod of MODULO_META) {
          await this.documentos.restaurarModulo(mod.id);
        }
      } else {
        this.personal.reset();
        this.noticias.reset();
        await this.documentos.reset();
        await this.archivos.vaciar();
      }
      this.confirmar.set(false);
      this.toast.success('El portal volvió al contenido original.');
    } catch {
      this.toast.error('No se pudo restaurar todo el contenido.');
    } finally {
      this.restaurando.set(false);
    }
  }
}
