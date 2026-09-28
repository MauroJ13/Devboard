# Devboard

Eine kleine, voll funktionsfähige Task-Management-App (Kanban) mit
React · TypeScript · Vite · React Router · useReducer · Tailwind CSS · SCSS · shadcn/ui.

## Starten

```bash
npm install
npm run dev
```

Weitere Skripte:

| Befehl              | Beschreibung                                |
| ------------------- | ------------------------------------------- |
| `npm run build`     | Type-Check (`tsc -b`) + Produktions-Build   |
| `npm run typecheck` | Nur TypeScript prüfen                       |
| `npm run preview`   | Produktions-Build lokal ansehen             |

## Supabase einrichten (optional)

Ohne Konfiguration speichert Devboard alles lokal im Browser (localStorage).
Mit Supabase werden Team, Boards und Tasks in der Datenbank gespeichert und sind
auf allen Geräten verfügbar.

1. Projekt auf [supabase.com](https://supabase.com) anlegen.
2. **SQL Editor → New query**: Inhalt von `supabase/schema.sql` einfügen und **Run**.
3. Secrets eintragen – in `.env.local` (liegt bereits im Projekt, ist per `.gitignore` geschützt):

   ```bash
   VITE_SUPABASE_URL=https://<projekt-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon / publishable key>
   ```

   Beide Werte findest du unter **Project Settings → API**. Vorlage: `.env.example`.
4. `npm run dev` neu starten. In der Navbar steht jetzt „Synchronisiert“ statt „Lokal“.

**Sicherheit**

- Nur den öffentlichen **anon/publishable** Key verwenden – niemals den `service_role`/secret Key.
  Alle `VITE_`-Variablen landen im Browser-Bundle.
- `.env.local` wird nicht committet (`.gitignore`), `.env.example` schon.
- Die RLS-Policies in `schema.sql` sind offen, weil die App (noch) keinen Login hat:
  Wer URL + anon-Key kennt, kann Daten ändern. Für den produktiven Einsatz Supabase Auth
  ergänzen und die Policies einschränken.

**Hinweise**

- Welches Team-Mitglied „ich“ bin (Profil), wird pro Browser gespeichert.
  Auf einem neuen Gerät wählst du im Profil „Bereits im Team?“ dein Mitglied aus.
- Beim Start mit Supabase ersetzt der Datenbank-Stand die lokalen Daten.
  Vorher nur lokal angelegte Daten werden dabei nicht automatisch hochgeladen.

## Routen

| Route             | Seite                                         |
| ----------------- | --------------------------------------------- |
| `/`               | Weiterleitung auf `/boards`                   |
| `/boards`         | Boards-Übersicht (erstellen, öffnen, löschen) |
| `/board/:boardId` | Board-Detailansicht mit Spalten & Tasks       |
| `/profile`        | Profil anlegen/bearbeiten, eigene Tasks, Team verwalten |
| `*`               | 404-Seite                                     |

## Data Flow

```
DevboardProvider (useReducer + localStorage)
  └─ DevboardContext { state, dispatch }
       ├─ useDevboard() / useBoard(id) / useUsers() / useCurrentUser()
       └─ Komponenten dispatchen Actions über die Action-Creator in reducers/actions.ts
```

- **Zentraler State** (`AppState`): `users` (Team), `currentUserId` (eigenes Profil, anfangs `null`),
  `boards` (jedes Board enthält `columns` und `tasks`). Die App startet leer – ohne Demo-Daten.
- **Reducer** (`src/reducers/appReducer.ts`): `CREATE_BOARD`, `UPDATE_BOARD`, `DELETE_BOARD`,
  `CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`, `MOVE_TASK`, `CREATE_USER`, `UPDATE_USER`,
  `DELETE_USER`, `SET_CURRENT_USER`, `HYDRATE`.
- **Action-Creator** (`src/reducers/actions.ts`) erzeugen IDs/Zeitstempel, damit der Reducer rein bleibt.
- **Tasks speichern nur `assignedUserId`** – der Name wird immer aus `users` gelesen.
  Eine Namensänderung im Profil wirkt sich daher sofort auf alle Task-Cards und Auswahlfelder aus.
- **Team**: Im Profil lassen sich Mitglieder hinzufügen, bearbeiten und entfernen.
  Wird ein Mitglied entfernt, werden seine Tasks „Nicht zugewiesen“. Neue Tasks sind standardmäßig niemandem zugewiesen.
- **Persistenz**: `usePersistentReducer` lädt den State beim Start aus `localStorage`
  (Key `devboard:state:v2`) und speichert jede Änderung.
- **Supabase-Sync** (`src/services/supabaseSync.ts`): Jede Action ändert zuerst sofort den lokalen State,
  danach schreibt der Provider sie der Reihe nach in die Datenbank. Beim Start werden die Daten per
  `HYDRATE` aus Supabase geladen. Der Status (Lokal / Synchronisiert / Speichert / Fehler) steht in der Navbar.

## Drag & Drop

Native HTML5 Drag & Drop API (keine zusätzliche Library). Tasks können zwischen Spalten
verschoben und innerhalb einer Spalte umsortiert werden; eine cyan-farbene Linie zeigt die
Einfügeposition. Auf Touch-Geräten (wo HTML5-DnD nicht unterstützt wird) lässt sich die Spalte
im „Task bearbeiten“-Dialog über das Feld **Spalte** ändern.

## Styling

- **Tailwind CSS v4** (über `@tailwindcss/vite`) für Layout, Abstände, Responsive Design, Farben und Hover-States.
  Die Design-Tokens (cyan/schwarz/weiß) liegen in `src/index.css`.
- **SCSS** für individuelle Komponenten-Styles, die mit Tailwind umständlich wären
  (Active-Indikator der Navbar, Drag-Zustände, Drop-Indikator, Hover-Reveal von Aktionen).
  Gemeinsame Variablen/Mixins: `src/styles/_variables.scss`, `src/styles/_mixins.scss`.
- **shadcn/ui** Komponenten in `src/components/ui` (Button, Dialog, Input, Textarea, Select, Label).

## Projektstruktur

```
src/
├── components/
│   ├── ui/                 shadcn/ui Komponenten
│   ├── Navbar/             Navbar.tsx + Navbar.scss
│   ├── Layout/
│   ├── PageHeader/
│   ├── BoardCard/          BoardCard.tsx + BoardCard.scss
│   ├── BoardColumn/        BoardColumn.tsx + BoardColumn.scss (Drop-Zone)
│   ├── TaskCard/           TaskCard.tsx + TaskCard.scss (draggable)
│   ├── CreateBoardDialog/
│   ├── ConfirmDialog/
│   ├── TaskFormDialog/     gemeinsames Formular für Erstellen & Bearbeiten
│   ├── CreateTaskDialog/
│   ├── EditTaskDialog/
│   ├── EditableTitle/
│   ├── MemberFormDialog/   Team-Mitglied anlegen/bearbeiten
│   ├── TeamSection/        Team verwalten (Profilseite)
│   ├── UserFields/         Name/E-Mail-Felder + Validierung
│   ├── SyncStatus/         Speicher-Status in der Navbar
│   └── UserSelect/
├── context/                DevboardContext + DevboardProvider
├── data/                   Standard-Spalten & leerer Startzustand
├── hooks/                  useDevboard, useBoard, useUsers, usePersistentReducer
├── lib/                    utils (cn), date, id, storage, supabase (Client)
├── services/               supabaseSync (Laden + Schreiben)
├── pages/                  Boards, BoardDetail, Profile, NotFound
├── reducers/               appReducer + Actions
├── styles/                 globale SCSS-Variablen, Mixins, globale Styles
├── types/                  User, Board, Task, Column, AppState …
├── App.tsx                 Routing
└── main.tsx
```

## Hinweis zu Deployment

Die App nutzt `BrowserRouter`. Im Dev-Server (`npm run dev`) und bei `npm run preview`
funktioniert ein Reload auf jeder Route automatisch. Auf einem eigenen Webserver muss
für alle Pfade auf `index.html` zurückgefallen werden (SPA-Fallback).
