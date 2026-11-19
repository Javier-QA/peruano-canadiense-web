
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const rutas = require('./rutas');
const archivos = require('./modulos/archivos/archivos.rutas');

const {
  noEncontrado,
  manejarErrores
} = require('./middlewares/errores');

const app = express();

// CONFIGURACIÓN ORIGINAL

app.set('trust proxy', 1);
app.disable('x-powered-by');

// SEGURIDAD

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    },
    contentSecurityPolicy: false
  })
);

// CORS

const origenesPermitidos = new Set(env.origenesCors);

app.use(
  cors({
    origin(origen, callback) {

      if (!origen) {
        return callback(null, true);
      }

      const limpio = origen.replace(/\/+$/, '');

      if (origenesPermitidos.has(limpio)) {
        return callback(null, true);
      }

      console.warn(
        `CORS: origen no permitido: ${origen}`
      );

      return callback(null, false);
    },

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With'
    ],

    credentials: true,
    optionsSuccessStatus: 204
  })
);

// MIDDLEWARES ORIGINALES

app.use(express.json({
  limit: '2mb'
}));

app.use(express.urlencoded({
  extended: false,
  limit: '2mb'
}));

app.use(
  morgan(env.produccion ? 'combined' : 'dev')
);

// RUTAS ORIGINALES

app.use('/api', rutas);

// ARCHIVOS ORIGINALES

app.use('/', archivos);

// RUTA PRINCIPAL

app.get('/', (_req, res) => {
  res.json({
    servicio: 'API IESPP Peruano Canadiense',
    salud: '/api/salud'
  });
});

// MANEJO DE ERRORES

app.use(noEncontrado);
app.use(manejarErrores);

module.exports = app;
