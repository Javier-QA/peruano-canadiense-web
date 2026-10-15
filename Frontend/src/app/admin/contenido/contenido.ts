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

      <section class="executive-catalog" aria-labelledby="catalog-title">
        <div class="executive-heading">
          <div>
            <h2 id="catalog-title">Secciones del portal</h2>
            <p>Selecciona una sección para gestionar su contenido.</p>
          </div>
          <span class="executive-total">{{ filas().length }} secciones</span>
        </div>
        <div class="executive-grid" aria-label="Módulos del portal público">
          @for (mod of filas(); track mod.id) {
            <a class="executive-card" [routerLink]="mod.adminPath" [attr.aria-label]="'Editar ' + mod.titulo">
              <div class="executive-card-top">
                <span class="executive-icon"><i class="fa-solid {{ mod.icon }}" aria-hidden="true"></i></span>
                <i class="fa-solid fa-arrow-up-right-from-square executive-arrow" aria-hidden="true"></i>
              </div>
              <div class="executive-card-bottom">
                <h3 class="executive-name">{{ mod.titulo }}</h3>
                <div class="executive-card-meta">
                  <span class="executive-counts">{{ mod.publicados }} publicados <span aria-hidden="true">·</span> {{ mod.borradores }} borradores</span>
                  @if (mod.modificado) {
                    <span class="executive-status">Modificado</span>
                  }
                </div>
              </div>
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
    /* Nombres exclusivos: evitan el selector global .admin-shell .modulo-tile,
       responsable de apilar verticalmente el catálogo anterior. */
    .executive-catalog { min-width: 0; }
    .executive-heading {
      display: flex; justify-content: space-between; align-items: center;
      gap: 12px; margin: 0 0 16px;
    }
    .executive-heading h2 { margin: 0 0 3px; font-size: 1.1rem; color: var(--adm-ink); font-weight: 750; }
    .executive-heading p { margin: 0; color: var(--adm-muted); font-size: .82rem; }
    .executive-total { white-space: nowrap; color: var(--adm-muted); font-size: .79rem; }
    .executive-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      align-items: stretch;
    }
    .executive-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 20px;
      min-width: 0;
      min-height: 168px;
      margin: 0;
      padding: 19px;
      border: 1px solid var(--adm-line, #dfe5ee);
      border-radius: 16px;
      background: var(--adm-surface, #fff);
      color: inherit;
      text-decoration: none;
      box-shadow: 0 3px 12px rgba(24, 38, 60, .035);
      transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease;
    }
    .executive-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
    .executive-icon {
      display: inline-flex; align-items: center; justify-content: center;
      flex: 0 0 43px; width: 43px; height: 43px;
      border-radius: 12px; background: #fff0e4; color: var(--adm-brand);
      font-size: 1.04rem;
    }
    .executive-arrow { color: #98a4b5; font-size: .76rem; margin-top: 2px; }
    .executive-card-bottom { min-width: 0; }
    .executive-name { margin: 0 0 11px; color: var(--adm-ink); font-size: 1rem; font-weight: 750; line-height: 1.35; }
    .executive-card-meta {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 8px;
    }
    .executive-counts { font-size: .75rem; color: var(--adm-muted); line-height: 1.4; }
    .executive-counts span { margin-inline: 3px; color: #a5b0bd; }
    .executive-status {
      flex: 0 0 auto; white-space: nowrap;
      padding: 4px 8px; border-radius: 7px;
      background: #fff4e9; color: #ad4a0e;
      font-size: .68rem; font-weight: 700;
    }
    .executive-card:hover { border-color: #edb78e; box-shadow: 0 9px 22px rgba(24, 38, 60, .08); transform: translateY(-2px); }
    .executive-card:hover .executive-arrow { color: var(--adm-brand); }
    .executive-card:focus-visible { outline: 3px solid var(--adm-brand); outline-offset: 3px; }
    @media (max-width: 1250px) { .executive-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 940px) { .executive-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 590px) {
      .executive-grid { grid-template-columns: 1fr; gap: 12px; }
      .executive-card { min-height: 146px; padding: 16px; }
      .executive-heading { align-items: flex-start; }
      .page-header { padding: 16px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .executive-card { transition: none; }
      .executive-card:hover { transform: none; }
    }
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
