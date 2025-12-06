# Hackaton - Networking App

> Tinder-style app para conectar gente innovadora. Sin formularios tradicionales - solo sube tu CV/Portfolio en PDF.

## Vision

Crear una plataforma de networking donde profesionales innovadores puedan conectar de forma rápida y sin fricción. El único input requerido es un PDF (CV o Portfolio), del cual extraemos toda la información relevante usando AI.

---

## Tech Stack

| Capa | Tecnología | Versión |
|------|------------|---------|
| Framework | Next.js | 16.x |
| React | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui + AI Elements | new-york |
| ORM | Drizzle ORM | latest |
| Database | Supabase PostgreSQL | - |
| Storage | Supabase Storage | - |
| Auth | Sin auth (MVP) | - |
| AI | Vercel AI SDK + DeepSeek | latest |
| AI UI | AI Elements | latest |
| PDF Parsing | unpdf | latest |

---

## User Flow

```
1. Landing Page
   └── CTA: "Sube tu CV/Portfolio"
              │
              ▼
2. Upload PDF
   └── Drag & drop o click para subir
              │
              ▼
3. AI Processing
   └── Extraemos: nombre, título, skills, experiencia, "vibe"
              │
              ▼
4. Preguntas Rápidas (2-3)
   ├── "¿Qué buscas?" → Cofounder / Mentor / Networking / Inversión
   ├── "¿Qué ofreces?" → Tech / Business / Capital / Conexiones
   └── "¿Industria?" → AI, Fintech, Healthtech, etc.
              │
              ▼
5. Perfil Generado
   └── Preview del perfil antes de activar
              │
              ▼
6. Swipe Profiles
   └── Ver otros perfiles, swipe left/right
              │
              ▼
7. Match!
   └── Intercambio de contacto (LinkedIn/Email)
```

---

## Database Schema

### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK (auto-generated) |
| email | text | Email del usuario |
| name | text | Nombre extraído del CV |
| headline | text | Título/posición actual |
| skills | text[] | Array de skills |
| experience_years | int | Años de experiencia |
| industry | text | Industria principal |
| bio | text | Bio generada por AI |
| avatar_url | text | URL del avatar (si hay) |
| pdf_url | text | URL del PDF en storage |
| looking_for | text | Qué busca (cofounder, mentor, etc.) |
| offering | text | Qué ofrece |
| preferred_industries | text[] | Industrias de interés |
| is_active | boolean | Perfil visible para swipe |
| status | text | pending / processing / ready / error |
| error | text | Código de error (nullable) |
| onboarding_completed | boolean | Completó preguntas rápidas |
| created_at | timestamp | Fecha creación |
| updated_at | timestamp | Última actualización |

### matches
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_a | uuid | FK to profiles |
| user_b | uuid | FK to profiles |
| created_at | timestamp | Fecha del match |

> **Nota:** Un match se crea solo cuando ambos usuarios hacen swipe right (mutual).

### swipes
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| swiper_id | uuid | FK to profiles (quien hace swipe) |
| swiped_id | uuid | FK to profiles (a quien le hacen swipe) |
| direction | text | left / right |
| created_at | timestamp | Fecha del swipe |

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | Subir PDF y procesar con AI |
| GET | /api/profiles | Obtener perfiles para swipe |
| POST | /api/swipe | Registrar un swipe |
| GET | /api/matches | Obtener matches del usuario |
| PATCH | /api/profile | Actualizar perfil |

---

## Pages

| Route | Description |
|-------|-------------|
| / | Landing page con CTA |
| /onboarding | Upload PDF + preguntas |
| /profile | Ver/editar mi perfil |
| /discover | Swipe de perfiles |
| /matches | Lista de matches |

---

## AI Extraction Schema

Lo que extraemos del PDF:

```typescript
interface ExtractedProfile {
  name: string;
  headline: string;           // "Senior Engineer @ Startup"
  skills: string[];           // ["React", "Node.js", "AI/ML"]
  experience_years: number;   // 5
  industry: string;           // "Tech/SaaS"
  education?: string;         // "MIT"
  bio: string;                // Generado por AI basado en el CV
  contact?: {
    email?: string;
    linkedin?: string;
    github?: string;
  };
}
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (DeepSeek via Vercel AI SDK)
DEEPSEEK_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Tasks

### Phase 1: Foundation
- [x] Crear documentación
- [x] Instalar dependencias (drizzle-orm, supabase, ai-sdk, unpdf, zod)
- [ ] Configurar Supabase (proyecto + bucket "cvs")
- [x] Configurar Drizzle schema (`src/db/schema.ts`)
- [x] Setup config (`src/lib/config.ts`)
- [ ] Setup environment variables (`.env.local`)
- [ ] Run `pnpm db:push` para crear tablas

### Phase 2: Core Features
- [x] API: Upload PDF + extracción texto (`/api/upload`)
- [x] API: Procesamiento AI con DeepSeek (`src/lib/ai.ts`)
- [x] UI: Componente upload PDF (`src/components/pdf-upload.tsx`)
- [x] UI: Componente preguntas rápidas (`src/components/onboarding-questions.tsx`)
- [ ] UI: Preview de perfil
- [x] API: PATCH profile (`/api/profile/[id]`)

### Phase 3: Matching
- [x] API: Obtener perfiles para swipe (`/api/profiles`)
- [x] API: Registrar swipes (`/api/swipe`)
- [x] API: Detectar matches (en `/api/swipe`)
- [x] UI: Swipe cards (`/discover`)
- [ ] UI: Lista de matches (`/matches`)

### Phase 4: Polish
- [ ] Auth flow completo
- [ ] Animaciones swipe
- [ ] Responsive design
- [ ] Error handling mejorado
- [ ] Loading states

---

## Design Decisions (KISS/YAGNI)

1. **Sin auth**: MVP sin login. Perfiles con UUID auto-generado. Auth se agrega después si es necesario.
2. **PDF-first**: El PDF es la fuente de verdad, las preguntas complementan.
3. **AI extraction**: DeepSeek via Vercel AI SDK por costo-efectividad.
4. **Sin RLS**: Sin auth no hay RLS. Seguridad se agrega cuando haya auth.
5. **Swipe simple**: Left = no, Right = sí. Sin superlike, boost, ni undo.
6. **Status simple**: `pending → processing → ready | error`. Sin estados intermedios.
7. **Single-select**: `looking_for` y `offering` son texto simple, no arrays.
8. **Sin privacidad flags**: Todos los datos de contacto se comparten en match (MVP).

---

## Notes

- Proyecto para hackaton - priorizar velocidad sobre perfección
- MVP funcional > features completas
- UI básica con shadcn, sin over-engineering
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Ain't Gonna Need It

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── upload/route.ts      # POST: upload PDF + AI extraction
│   ├── onboarding/page.tsx      # Upload + questions flow
│   ├── layout.tsx
│   └── page.tsx                 # Landing
├── components/
│   ├── ui/                      # shadcn components
│   ├── pdf-upload.tsx           # Drag & drop PDF upload
│   └── onboarding-questions.tsx # Quick questions form (TODO)
├── db/
│   ├── schema.ts                # Drizzle schema (profiles, swipes, matches)
│   └── client.ts                # Drizzle client
└── lib/
    ├── config.ts                # Environment config
    ├── ai.ts                    # DeepSeek extraction
    ├── pdf.ts                   # PDF text extraction
    └── supabase/
        ├── server.ts            # Server-side Supabase client
        └── client.ts            # Browser Supabase client
```

---

## Next Steps (Priority)

1. **Configurar Supabase** - Crear proyecto, bucket "cvs", obtener keys
2. **Crear `.env.local`** - Con las credenciales
3. **Run `pnpm db:push`** - Crear tablas en Supabase
4. **UI: Lista de matches** (`/matches`)
5. **Probar flujo completo** - Upload → Onboarding → Discover → Match
