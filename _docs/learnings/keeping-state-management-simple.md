# Keeping State Simple and Scalable in React & React Native: A Practical Approach for SaaS Apps

When building a SaaS application that spans **web (React/Next.js)** and **mobile (React Native/Expo)**, developers often face an avalanche of library choices for state management, data fetching, and form handling.

The temptation? Pull in every “recommended” tool you read about.
The result? Over-engineered abstraction layers, complex onboarding for new devs, and code that's hard to debug.

This post walks through a **lean, scalable architecture** for managing state and API communication across platforms — without falling into the complexity trap.

---

## The Pain Points

1. **Too Many State Layers**
   Mixing local state, global UI state, and server cache in the same store often leads to messy, tightly coupled code.

2. **Reinventing the Wheel for Data Fetching**
   Without a caching library, you end up manually handling retries, stale data, and pagination — repeatedly.

3. **Mobile vs Web Divergence**
   Writing separate state and API layers for mobile and web doubles your maintenance.

4. **Over-Abstraction**
   Adding Redux + Sagas + Observables (or similar heavy stacks) before you actually *need* them.

---

## The Philosophy: Minimal Layers, Clear Separation

We split our client-side state into **three categories**:

| Type                           | Example                  | Where to store                           |
| ------------------------------ | ------------------------ | ---------------------------------------- |
| **Local state**                | Modal open, form field   | `useState` or `useReducer`               |
| **UI-global state**            | Theme, sidebar toggle    | Lightweight store (`zustand`)            |
| **Server cache (remote data)** | Users list, billing data | Data-fetching library (`TanStack Query`) |

---

## Why These Libraries?

* **Zustand** → Simple global store, minimal API, no boilerplate.
* **TanStack Query** → Handles caching, retries, pagination, background refresh — so you don’t.
* **react-hook-form + zod** → Easy form state management with schema-based validation that runs on both client and server.
* **Axios (or fetch wrapper)** → Central place for interceptors (auth, logging).

This combination lets each tool **do one thing well** without stepping on the others’ toes.

---

## Example Flow: Authentication & Data Fetch

Let’s look at a simple login + fetch example with this setup.

---

### 1. API Client

A single HTTP instance with optional interceptors for attaching auth tokens.

```ts
// http.ts
import axios from "axios";

export const http = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 15000,
});

let getToken: () => string | undefined = () => undefined;
export const setTokenGetter = (fn: typeof getToken) => { getToken = fn; };

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

### 2. Auth Store (Zustand)

Keeps auth state minimal and focused.

```ts
// useAuth.ts
import { create } from "zustand";
import { http, setTokenGetter } from "./http";

export const useAuth = create((set) => {
  setTokenGetter(() => useAuth.getState().token);

  return {
    token: undefined as string | undefined,
    user: null,
    async login(email: string, password: string) {
      const { data } = await http.post("/auth/login", { email, password });
      set({ token: data.access_token, user: data.user });
    },
    logout() { set({ token: undefined, user: null }); }
  };
});
```

---

### 3. Data Fetching (TanStack Query)

Server state lives here — cached, paginated, and easy to refetch.

```ts
// useUsers.ts
import { useQuery } from "@tanstack/react-query";
import { http } from "./http";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await http.get("/users");
      return data;
    },
  });
}
```

---

### 4. Form Handling (react-hook-form + zod)

Schema-validated forms that work across web & mobile.

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(LoginSchema),
  });
  const login = useAuth((s) => s.login);

  return (
    <form onSubmit={handleSubmit((data) => login(data.email, data.password))}>
      <input {...register("email")} placeholder="Email" />
      <input type="password" {...register("password")} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Key Takeaways

1. **Separate local, UI-global, and server state** — don’t cram them together.
2. Use **Zustand** for small, intentional global state.
3. Use **TanStack Query** for any data coming from your API.
4. Validate at the edges — **react-hook-form** + **zod** keeps forms and backend in sync.
5. Keep your API client centralized so auth, logging, and error handling are consistent.

---

## Why This Scales

* **Web + Mobile parity** → Shared `api-client`, `auth`, and `types` mean both platforms stay in sync.
* **Minimal complexity** → Each layer has one responsibility.
* **Easy to onboard** → New devs learn three small tools instead of one giant abstraction.

---

If you start with this minimal approach, you’ll avoid the **“Redux from day one”** trap while still having a clear upgrade path for when your app grows.

