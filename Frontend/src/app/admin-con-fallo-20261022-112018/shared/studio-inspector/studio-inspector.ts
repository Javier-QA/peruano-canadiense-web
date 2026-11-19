import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  signal
} from '@angular/core';

import {
  DomSanitizer
} from '@angular/platform-browser';

const PAGINAS: Record<string, string> = {
  '/admin/inicio': '/inicio',
  '/admin/nosotros': '/nosotros',
  '/admin/admision': '/admision',
  '/admin/becas': '/becas',
  '/admin/costos': '/costos',
  '/admin/estadisticas': '/estadisticas',
  '/admin/horarios': '/horarios',
  '/admin/inversiones': '/inversiones',
  '/admin/licenciamiento': '/licenciamiento',
  '/admin/programas': '/programas',
  '/admin/noticias': '/noticias',
  '/admin/servicios': '/servicios',
  '/admin/transparencia': '/transparencia',
  '/admin/reglamentos': '/reglamentos',
  '/admin/procedimientos': '/procedimientos',
  '/admin/psicopedagogico': '/psicopedagogico',
  '/admin/servicio-social': '/servicio-social',
  '/admin/soporte-medico': '/soporte-medico',
  '/admin/repositorio-copy': '/repositorio',
  '/admin/mesa-de-partes': '/mesa-de-partes',
  '/admin/pagina-reclamaciones': '/reclamaciones',
  '/admin/privacidad': '/privacidad'
};

const AYUDAS: Record<string, string[]> = {
  '/admin/inicio': [
    'Selecciona la secciÃ³n de la portada.',
    'Modifica textos, imÃ¡genes y enlaces disponibles.',
    'Guarda desde el editor y actualiza la vista previa.'
  ],
  '/admin/nosotros': [
    'Selecciona MisiÃ³n, VisiÃ³n u otra secciÃ³n.',
    'Actualiza el contenido institucional.',
    'Guarda y verifica el resultado publicado.'
  ],
  '/admin/admision': [
    'Selecciona Convocatoria, Requisitos u otra pestaÃ±a.',
    'Actualiza fechas, textos y documentos.',
    'Guarda y revisa la pÃ¡gina de AdmisiÃ³n.'
  ],
  '/admin/programas': [
    'Selecciona el programa acadÃ©mico.',
    'Modifica sus campos e imÃ¡genes disponibles.',
    'Guarda y consulta la publicaciÃ³n.'
  ],
  '/admin/noticias': [
    'Selecciona una noticia o crea una nueva.',
    'Edita sus datos y contenido.',
    'Guarda o publica desde los controles originales.'
  ],
  '/admin/servicios': [
    'Selecciona el servicio institucional.',
    'Edita textos, enlaces e imÃ¡genes disponibles.',
    'Guarda y verifica la pÃ¡gina pÃºblica.'
  ],
  '/admin/transparencia': [
    'Selecciona el rubro de transparencia.',
    'Edita la informaciÃ³n y documentos disponibles.',
    'Guarda y comprueba los enlaces pÃºblicos.'
  ]
};

@Component({
  selector: 'app-admin-studio-inspector',
  standalone: true,
  template: `
    <aside class="inspector">

      <header class="inspector-header">
        <div>
          <span class="overline">ADMINISTRADOR VISUAL</span>
          <h3>Inspector de trabajo</h3>
          <p>{{ titulo() }}</p>
        </div>
        <i class="fa fa-sliders" aria-hidden="true"></i>
      </header>

      <div class="inspector-tabs">
        <button
          type="button"
          [class.active]="vista() === 'preview'"
          (click)="vista.set('preview')">
          <i class="fa fa-display" aria-hidden="true"></i>
          Vista
        </button>

        <button
          type="button"
          [class.active]="vista() === 'propiedades'"
          (click)="vista.set('propiedades')">
          <i class="fa fa-list-check" aria-hidden="true"></i>
          Propiedades
        </button>
      </div>

      @if (vista() === 'preview') {

        @if (tieneVistaPublica()) {

          <div class="preview-toolbar">

            <span>Vista pÃºblica</span>

            <div class="device-tools">

              <button
                type="button"
                [class.selected]="dispositivo() === 'desktop'"
                title="Escritorio"
                aria-label="Vista de escritorio"
                (click)="dispositivo.set('desktop')">
                <i class="fa fa-desktop"></i>
              </button>

              <button
                type="button"
                [class.selected]="dispositivo() === 'tablet'"
                title="Tableta"
                aria-label="Vista de tableta"
                (click)="dispositivo.set('tablet')">
                <i class="fa fa-tablet-screen-button"></i>
              </button>

              <button
                type="button"
                [class.selected]="dispositivo() === 'mobile'"
                title="MÃ³vil"
                aria-label="Vista mÃ³vil"
                (click)="dispositivo.set('mobile')">
                <i class="fa fa-mobile-screen-button"></i>
              </button>

            </div>

          </div>

          <div class="preview-area">

            <iframe
              [class.desktop]="dispositivo() === 'desktop'"
              [class.tablet]="dispositivo() === 'tablet'"
              [class.mobile]="dispositivo() === 'mobile'"
              [src]="previewUrl()"
              [title]="'Vista pÃºblica de ' + titulo()"
              loading="lazy">
            </iframe>

          </div>

          <div class="preview-actions">

            <button
              type="button"
              (click)="actualizarPreview()">
              <i class="fa fa-rotate-right"></i>
              Actualizar vista
            </button>

            <a
              [href]="rutaPublica()"
              target="_blank"
              rel="noopener noreferrer">
              <i class="fa fa-arrow-up-right-from-square"></i>
              Abrir
            </a>

          </div>

          <p class="inspector-note">
            La vista muestra la pÃ¡gina pÃºblica.
            Los borradores todavÃ­a no se reflejan
            automÃ¡ticamente; guarda y actualiza
            para comprobar lo publicado.
          </p>

        } @else {

          <div class="empty-preview">
            <i class="fa fa-screwdriver-wrench"></i>
            <strong>MÃ³dulo de gestiÃ³n</strong>
            <p>
              Esta pantalla administra informaciÃ³n
              mediante los formularios originales.
              No tiene una vista pÃºblica independiente.
            </p>
          </div>

        }

      } @else {

        <div class="properties">

          <div class="section-caption">
            CAMPO SELECCIONADO
          </div>

          @if (campoActivo(); as campo) {

            <div class="property-card">
              <span>Elemento</span>
              <strong>{{ campo.nombre }}</strong>

              <span>Tipo</span>
              <strong>{{ campo.tipo }}</strong>

              @if (campo.ayuda) {
                <span>InformaciÃ³n</span>
                <p>{{ campo.ayuda }}</p>
              }
            </div>

          } @else {

            <div class="empty-property">
              <i class="fa fa-arrow-pointer"></i>
              <p>
                Selecciona un campo del formulario
                para identificar quÃ© elemento
                estÃ¡s modificando.
              </p>
            </div>

          }

          <div class="section-caption">
            FLUJO DE TRABAJO
          </div>

          <ol class="steps">
            @for (paso of pasos(); track paso) {
              <li>{{ paso }}</li>
            }
          </ol>

          <div class="property-warning">
            Los botones Guardar, Publicar,
            Historial y Restaurar pertenecen
            al mÃ³dulo original.
          </div>

        </div>

      }

      <footer class="inspector-footer">
        <span class="dot"></span>
        Inspector activo
      </footer>

    </aside>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      height: 100%;
    }

    .inspector {
      height: 100%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: var(--adm-surface);
      color: var(--adm-ink);
      border-left: 1px solid var(--adm-line);
    }

    .inspector-header {
      padding: 21px 20px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      border-bottom: 1px solid var(--adm-line);
    }

    .inspector-header > i {
      color: var(--adm-brand);
      font-size: 1.1rem;
      margin-top: 8px;
    }

    .overline {
      color: var(--adm-brand);
      font-size: .63rem;
      font-weight: 800;
      letter-spacing: .11em;
    }

    h3 {
      font-size: 1rem;
      margin: 8px 0 5px;
      color: var(--adm-ink);
    }

    .inspector-header p {
      margin: 0;
      font-size: .73rem;
      color: var(--adm-muted);
    }

    .inspector-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      margin: 14px 14px 0;
      padding: 4px;
      background: var(--adm-bg);
      border: 1px solid var(--adm-line);
      border-radius: 10px;
    }

    .inspector-tabs button {
      border: none;
      background: transparent;
      border-radius: 7px;
      padding: 10px 5px;
      color: var(--adm-muted);
      font: inherit;
      font-size: .75rem;
      font-weight: 700;
      cursor: pointer;
    }

    .inspector-tabs button.active {
      background: var(--adm-surface);
      color: var(--adm-brand);
      box-shadow: 0 2px 8px rgba(0,0,0,.07);
    }

    .inspector-tabs i {
      margin-right: 5px;
    }

    .preview-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 16px 14px 12px;
      font-size: .73rem;
      font-weight: 750;
    }

    .device-tools {
      display: flex;
      padding: 3px;
      gap: 2px;
      background: var(--adm-bg);
      border: 1px solid var(--adm-line);
      border-radius: 8px;
    }

    .device-tools button {
      border: 0;
      background: transparent;
      color: var(--adm-muted);
      width: 29px;
      height: 28px;
      border-radius: 6px;
      cursor: pointer;
    }

    .device-tools button.selected {
      background: var(--adm-brand);
      color: #fff;
    }

    .preview-area {
      margin: 0 13px;
      flex: 1;
      min-height: 380px;
      max-height: 65vh;
      overflow: auto;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      background: #101827;
      padding: 10px;
      border: 1px solid var(--adm-line);
      border-radius: 10px;
    }

    .preview-area iframe {
      flex: 0 0 auto;
      height: 570px;
      background: white;
      border: none;
      border-radius: 5px;
    }

    .preview-area iframe.desktop {
      width: 1060px;
      transform: scale(.34);
      transform-origin: top left;
      margin-right: -700px;
      margin-bottom: -370px;
    }

    .preview-area iframe.tablet {
      width: 768px;
      transform: scale(.43);
      transform-origin: top left;
      margin-right: -438px;
      margin-bottom: -325px;
    }

    .preview-area iframe.mobile {
      width: 375px;
      transform: scale(.75);
      transform-origin: top left;
      margin-right: -94px;
      margin-bottom: -142px;
    }

    .preview-actions {
      display: flex;
      gap: 8px;
      padding: 14px;
    }

    .preview-actions button,
    .preview-actions a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      text-decoration: none;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--adm-line);
      background: var(--adm-surface);
      color: var(--adm-ink);
      cursor: pointer;
      font: inherit;
      font-size: .72rem;
      font-weight: 750;
    }

    .preview-actions button {
      flex: 1;
    }

    .preview-actions button:hover,
    .preview-actions a:hover {
      border-color: var(--adm-brand);
    }

    .inspector-note {
      margin: 0 14px 20px;
      font-size: .72rem;
      line-height: 1.65;
      color: var(--adm-muted);
    }

    .empty-preview {
      margin: 22px 14px;
      padding: 28px 16px;
      border: 1px dashed var(--adm-line);
      border-radius: 10px;
      text-align: center;
      color: var(--adm-muted);
    }

    .empty-preview i {
      font-size: 1.7rem;
      color: var(--adm-brand);
    }

    .empty-preview strong {
      display: block;
      margin-top: 12px;
      color: var(--adm-ink);
    }

    .empty-preview p {
      font-size: .78rem;
      line-height: 1.7;
    }

    .properties {
      padding: 18px 15px;
      display: grid;
      gap: 14px;
    }

    .section-caption {
      font-size: .65rem;
      font-weight: 800;
      letter-spacing: .09em;
      color: var(--adm-muted);
    }

    .property-card,
    .empty-property {
      border: 1px solid var(--adm-line);
      border-radius: 11px;
      padding: 16px;
      background: var(--adm-bg);
    }

    .property-card {
      display: grid;
      gap: 7px;
    }

    .property-card span {
      color: var(--adm-muted);
      font-size: .7rem;
    }

    .property-card strong {
      font-size: .82rem;
      overflow-wrap: anywhere;
    }

    .property-card p,
    .empty-property p {
      color: var(--adm-muted);
      font-size: .75rem;
      line-height: 1.6;
    }

    .empty-property {
      text-align: center;
    }

    .empty-property i {
      color: var(--adm-brand);
      font-size: 1.4rem;
    }

    .steps {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 17px 17px 17px 35px;
      border: 1px solid var(--adm-line);
      border-radius: 10px;
      font-size: .76rem;
      line-height: 1.6;
    }

    .steps li::marker {
      color: var(--adm-brand);
      font-weight: 800;
    }

    .property-warning {
      padding: 13px;
      background: var(--adm-brand-soft);
      color: var(--adm-ink);
      border-radius: 9px;
      font-size: .73rem;
      line-height: 1.6;
    }

    .inspector-footer {
      margin-top: auto;
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 13px 18px;
      border-top: 1px solid var(--adm-line);
      color: var(--adm-muted);
      font-size: .7rem;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #0ca76b;
    }

    @media (max-width: 700px) {
      .preview-area {
        min-height: 280px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminStudioInspector {

  private readonly sanitizer = inject(DomSanitizer);

  readonly ruta = input.required<string>();
  readonly titulo = input.required<string>();

  readonly vista = signal<'preview' | 'propiedades'>(
    'preview'
  );

  readonly dispositivo = signal<
    'desktop' | 'tablet' | 'mobile'
  >('desktop');

  readonly revision = signal(0);

  readonly campoActivo = signal<{
    nombre: string;
    tipo: string;
    ayuda: string;
  } | null>(null);

  readonly rutaPublica = computed(
    () => PAGINAS[this.ruta()] ?? '/inicio'
  );

  readonly tieneVistaPublica = computed(
    () => Object.prototype.hasOwnProperty.call(
      PAGINAS,
      this.ruta()
    )
  );

  readonly pasos = computed(
    () => AYUDAS[this.ruta()] ?? [
      'Revisar los registros existentes.',
      'Editar con los formularios de este mÃ³dulo.',
      'Guardar y comprobar el resultado.'
    ]
  );

  readonly previewUrl = computed(() => {

    const origen =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:4200';

    const url =
      `${origen}${this.rutaPublica()}?studio=${this.revision()}`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);

  });

  actualizarPreview(): void {
    this.revision.update(n => n + 1);
  }

  @HostListener('document:focusin', ['$event'])
  detectarCampo(evento: FocusEvent): void {

    if (typeof document === 'undefined') return;

    const elemento = evento.target;

    if (!(elemento instanceof HTMLElement)) return;

    const main = document.querySelector('.admin-main');

    if (!main || !main.contains(elemento)) return;

    const esCampo = elemento.matches(
      'input, textarea, select, [contenteditable="true"]'
    );

    if (!esCampo) return;

    const contenedor = elemento.closest(
      '.form-row, .campo, app-campo-texto, ' +
      'app-campo-rico, app-campo-seleccion'
    );

    const etiqueta = contenedor?.querySelector('label');

    const nombre =
      etiqueta?.textContent?.trim() ||
      elemento.getAttribute('aria-label') ||
      elemento.getAttribute('placeholder') ||
      'Campo del formulario';

    const ayuda =
      contenedor?.querySelector(
        '.form-hint, .campo-ayuda, small, p'
      )?.textContent?.trim() || '';

    const tipo =
      elemento instanceof HTMLTextAreaElement
        ? 'Texto extenso'
        : elemento instanceof HTMLSelectElement
          ? 'SelecciÃ³n'
          : elemento.getAttribute('type') === 'number'
            ? 'NÃºmero'
            : 'Texto';

    this.campoActivo.set({
      nombre,
      tipo,
      ayuda
    });
  }
}