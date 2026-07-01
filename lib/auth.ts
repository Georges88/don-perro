export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  petPreference?: "dog" | "cat" | "multiple" | null;
}

const AUTH_STORAGE_KEY = "don_perro_auth_user";
const CUSTOMER_PROFILES_STORAGE_KEY = "don_perro_customer_profiles";

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
  setSavedCustomerProfile(user);
  window.dispatchEvent(new Event("auth-updated"));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("auth-updated"));
}

export function getSavedCustomerProfile(email: string): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const savedProfiles = localStorage.getItem(CUSTOMER_PROFILES_STORAGE_KEY);
    if (!normalizedEmail || !savedProfiles) return null;

    const parsed = JSON.parse(savedProfiles) as Record<string, Partial<AuthUser>>;
    const profile = parsed[normalizedEmail];
    if (!profile) return null;

    return {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: normalizedEmail,
      phone: profile.phone || "",
      petPreference: profile.petPreference ?? null,
    };
  } catch (error) {
    console.error("Failed to read saved customer profile", error);
    return null;
  }
}

export function setSavedCustomerProfile(user: AuthUser) {
  if (typeof window === "undefined" || !user.email) return;

  try {
    const normalizedEmail = user.email.trim().toLowerCase();
    const savedProfiles = localStorage.getItem(CUSTOMER_PROFILES_STORAGE_KEY);
    const profiles = savedProfiles ? JSON.parse(savedProfiles) as Record<string, Partial<AuthUser>> : {};

    profiles[normalizedEmail] = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: normalizedEmail,
      phone: user.phone || "",
      petPreference: user.petPreference ?? null,
    };

    localStorage.setItem(CUSTOMER_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error("Failed to save customer profile", error);
  }
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
