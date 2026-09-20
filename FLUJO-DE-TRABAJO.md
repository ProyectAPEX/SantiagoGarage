# Flujo de trabajo — Santiago Garage

Tres niveles, de menor a mayor riesgo. El sitio real **solo** cambia en el paso 3.

---

## 1. LOCAL — aquí se diseña

Solo lo ves tú, en tu computador. Nada sale a internet.

- URL: `http://localhost:3001`
- Rama de trabajo: `dev`
- Para levantarlo: pídeme "abre el local" (o `npm run dev` dentro de `app-web`).

Aquí se prueban todos los cambios que pida el cliente, las veces que haga falta.

---

## 2. PREVIEW — aquí lo aprueba el cliente

Una URL temporal de Vercel, distinta de la del sitio real. Se la mandas al cliente
para que vea y apruebe antes de publicar.

```bash
vercel deploy
```

Genera una URL tipo `https://app-web-xxxxx.vercel.app`.
**No toca `santiagogarage.cl`.**

---

## 3. PRODUCCIÓN — el sitio real

Solo cuando el cliente ya aprobó en el preview.

```bash
git checkout main
git merge dev
vercel deploy --prod
```

Esto sí publica en **https://santiagogarage.cl**.

---

## Reglas

- Nunca correr `vercel deploy --prod` con algo a medio terminar.
- Trabajar siempre en la rama `dev`, no en `main`.
- `main` = lo que está publicado. `dev` = lo que se está diseñando.

## Datos del proyecto

- Repo: https://github.com/ProyectAPEX/SantiagoGarage
- Producción: https://santiagogarage.cl
- Correo del dominio: sigue en v2nets (`207.210.102.221`) — no tocar los registros MX.
