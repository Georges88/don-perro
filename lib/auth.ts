export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  petPreference?: "dog" | "cat" | "multiple" | null;
}

const AUTH_STORAGE_KEY = "don_perro_auth_user";

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedUser) return null;

    const parsed = JSON.parse(savedUser) as Partial<AuthUser>;
    if (!parsed.email) return null;

    return {
      firstName: parsed.firstName || "",
      lastName: parsed.lastName || "",
      email: parsed.email,
      phone: parsed.phone || "",
      petPreference: parsed.petPreference ?? null
    };
  } catch (error) {
    console.error("Failed to read auth session", error);
    return null;
  }
}

export function setCurrentUser(user: AuthUser) {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-updated"));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("auth-updated"));
}

export function createUserFromEmail(email: string): AuthUser {
  const namePart = email.split("@")[0] || "Don Perro";
  const readableName = namePart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const [firstName = "Don", ...lastNameParts] = readableName.split(" ");

  return {
    firstName,
    lastName: lastNameParts.join(" ") || "Perro",
    email,
    phone: ""
  };
}
