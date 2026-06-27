# 🕊️ Mater — Coaching Espiritual Católico

## Pasos para poner en marcha

### 1. Obtener tu Anon Key de Supabase
1. Ve a https://yjdxxszakieuvnaxhdhg.supabase.co
2. Entra a tu proyecto → **Settings** → **API**
3. Copia el valor de **anon / public key**

### 2. Crear las tablas en Supabase
Ve a **SQL Editor** en tu proyecto y pega esto:

```sql
create table profiles (
  id uuid references auth.users primary key,
  name text,
  created_at timestamp default now()
);

create table diary_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  title text,
  text text,
  mood text,
  tag text,
  created_at timestamp default now()
);

create table plan_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  week int,
  day_index int,
  completed boolean default false,
  completed_at timestamp,
  unique(user_id, week, day_index)
);

create table streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  date date,
  unique(user_id, date)
);

-- Seguridad: solo cada usuario ve sus propios datos
alter table profiles enable row level security;
alter table diary_entries enable row level security;
alter table plan_progress enable row level security;
alter table streaks enable row level security;

create policy "Users see own profile" on profiles for all using (auth.uid() = id);
create policy "Users see own diary" on diary_entries for all using (auth.uid() = user_id);
create policy "Users see own progress" on plan_progress for all using (auth.uid() = user_id);
create policy "Users see own streaks" on streaks for all using (auth.uid() = user_id);
```

### 3. Configurar variables en Vercel
Al conectar el repo en Vercel, antes de hacer Deploy agrega estas variables:

| Variable | Valor |
|----------|-------|
| `REACT_APP_SUPABASE_URL` | `https://yjdxxszakieuvnaxhdhg.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | (la key que copiaste en el paso 1) |

### 4. Subir a GitHub y publicar
1. Crea un repositorio nuevo en github.com llamado `mater-app`
2. Sube todos estos archivos
3. Conecta el repo en vercel.com → **New Project**
4. Agrega las variables del paso 3
5. Clic en **Deploy** — en 2 minutos tendrás tu URL

---
Hecho con ❤️ para la Iglesia joven.
