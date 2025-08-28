# Fototeca

Una aplicación web moderna para gestionar y organizar tu colección de fotos con inteligencia artificial.

## Características

- 📸 Subida y gestión de imágenes
- 🏷️ Etiquetado automático con IA
- 📅 Vista de calendario
- 🔍 Búsqueda avanzada
- 🎨 Interfaz moderna con modo oscuro
- ☁️ Almacenamiento en la nube con Firebase

## Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **AI**: Google Genkit para sugerencia de etiquetas
- **Deployment**: Vercel

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tuusuario/fototeca.git
cd fototeca
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```
Edita `.env.local` con tus credenciales de Firebase.

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run typecheck` - Verifica los tipos de TypeScript

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Firestore Database
3. Habilita Firebase Storage
4. Habilita Authentication (opcional)
5. Copia las credenciales de configuración a tu archivo `.env.local`

## Despliegue en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Vercel desplegará automáticamente en cada push a main

## Variables de entorno

Consulta `.env.example` para ver todas las variables de entorno necesarias.

## Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

MIT
