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

      <div class="classic-grid" aria-label="Módulos del portal público">
        @for (mod of filas(); track mod.id) {
          <a class="classic-card" [routerLink]="mod.adminPath" [attr.aria-label]="'Editar ' + mod.titulo">
            <div class="classic-card-heading">
              <span class="classic-icon"><i class="fa-solid {{ mod.icon }}" aria-hidden="true"></i></span>
              <h2 class="classic-name">{{ mod.titulo }}</h2>
              <i class="fa-solid fa-arrow-up-right-from-square classic-link-icon" aria-hidden="true"></i>
            </div>
            <div class="classic-card-footer">
              <div class="classic-counts">
                <span><strong>{{ mod.publicados }}</strong> publicados</span>
                <span><strong>{{ mod.borradores }}</strong> en borrador</span>
              </div>
              @if (mod.modificado) {
                <span class="classic-status">Modificado</span>
              }
            </div>
          </a>
        }
      </div>
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
    /* Diseño de tarjetas aprobado; nombres aislados de los estilos globales. */
    .classic-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; align-items: stretch; }
    .classic-card { display: flex; flex-direction: column; justify-content: space-between; gap: 25px; min-width: 0; min-height: 207px; padding: 24px; margin: 0; background: var(--adm-surface, #fff); border: 1px solid var(--adm-line, #dfe5ee); border-radius: 19px; color: inherit; text-decoration: none; box-shadow: 0 4px 18px rgba(27,41,61,.035); transition: border-color .16s ease, box-shadow .16s ease; }
    .classic-card-heading { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .classic-icon { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 52px; width: 52px; height: 52px; border-radius: 14px; background: #fff0e4; color: var(--adm-brand, #f26a16); font-size: 1.15rem; }
    .classic-name { flex: 1 1 auto; min-width: 0; margin: 0; font-size: 1.08rem; line-height: 1.3; font-weight: 750; color: var(--adm-ink, #1e293b); }
    .classic-link-icon { flex: 0 0 auto; color: #9cabbc; font-size: .82rem; }
    .classic-card-footer { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; padding-top: 17px; border-top: 1px solid var(--adm-line, #dfe5ee); }
    .classic-counts { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 16px; color: var(--adm-muted, #61728c); font-size: .84rem; line-height: 1.4; }
    .classic-counts span { white-space: nowrap; }
    .classic-counts strong { font-weight: 750; color: var(--adm-ink, #1e293b); }
    .classic-status { display: inline-flex; padding: 5px 13px; border-radius: 999px; background: var(--adm-brand, #f26a16); color: #fff; font-size: .77rem; line-height: 1.2; font-weight: 700; white-space: nowrap; }
    .classic-card:hover { border-color: #efbb97; box-shadow: 0 9px 25px rgba(27,41,61,.07); }
    .classic-card:hover .classic-link-icon { color: var(--adm-brand, #f26a16); }
    .classic-card:focus-visible { outline: 3px solid var(--adm-brand, #f26a16); outline-offset: 3px; }
    @media (max-width: 1350px) { .classic-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 1000px) { .classic-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 650px) { .classic-grid { grid-template-columns: 1fr; gap: 14px; } .classic-card { min-height: 175px; padding: 19px; } .page-header { padding: 16px; } }
    @media (prefers-reduced-motion: reduce) { .classic-card { transition: none; } }
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
