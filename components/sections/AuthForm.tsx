"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Star, Check, ArrowRight, Loader2 } from "lucide-react";
import FormNotice from "@/components/ui/FormNotice";
import { clearAuthSession } from "@/lib/auth";

type AuthMode = "login" | "register";
type PetPref = "dog" | "cat" | "multiple" | null;

export default function AuthForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [petPref, setPetPref] = useState<PetPref>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register fields
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regTerms, setRegTerms] = useState(false);

  const handleToggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setSubmitted(false);
    setFormError(null);
  };

  const startShopifyLogin = (email: string) => {
    clearAuthSession();
    const loginUrl = new URL("/api/auth/login", window.location.origin);
    const returnTo = searchParams.get("returnTo");
    if (email) {
      loginUrl.searchParams.set("login_hint", email);
    }
    if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
      loginUrl.searchParams.set("return_to", returnTo);
    }
    window.location.href = loginUrl.toString();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = loginEmail.trim();
    if (!normalizedEmail) return setFormError("Please enter your email address.");
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setFormError("Please enter a valid email address.");
    setFormError(null);
    setLoading(true);
    startShopifyLogin(normalizedEmail);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = regEmail.trim();
    if (!regFirstName.trim() || !regLastName.trim()) return setFormError("Please enter your first and last name.");
    if (!normalizedEmail) return setFormError("Please enter your email address.");
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setFormError("Please enter a valid email address.");
    if (regPassword.length < 8) return setFormError("Please choose a password with at least 8 characters.");
    if (!regTerms) return setFormError("Please accept the Terms of Service and Privacy Policy to continue.");
    setFormError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/customers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: normalizedEmail,
          petPreference: petPref,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to create your customer profile.");
      }

      setSubmitted(true);
      setTimeout(() => {
        startShopifyLogin(normalizedEmail);
      }, 900);
    } catch (error) {
      setLoading(false);
      setFormError(error instanceof Error ? error.message : "Unable to create your customer profile.");
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-[0px_15px_45px_rgba(90,96,90,0.06)] border border-secondary/5 flex flex-col md:flex-row h-auto md:h-[720px]">
      
      {/* LEFT VISUAL SPLIT SCREEN (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-secondary text-white h-full">
        
        {/* Animated Cross-fading background image depending on mode */}
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login-bg"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-0"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkkcAdkyi6Y7qfIa4sv8hy7HGeBXY6gemfrFFwDqNTTovg2-FHDuWpxNxFL_PZcdrr-8gU0SSCp_4xuntpY_2EQ89jEy-ra3dCxcE80c2R6dIHfdh0O5bp2UCOURsj1LPE91zqlMievJ00UZ6Wwrnoc2YBNv7Q0fZQjl0v6iosvWyNtICS5d8YIJsROKBY-QDmTVECHUJRyFAJXv5uPYH0bCPKNGVsGS-VAG8ivxaYLeiW_H9tdU_hfq0EnA5h4y1Dbb8alPizH3-b"
                alt="Premium portrait of Golden Retriever"
                className="w-full h-full object-cover brightness-95"
              />
            </motion.div>
          ) : (
            <motion.div
              key="register-bg"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-0"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4HQj137pyonRLesH26iKYQphLnuAqtEt4VnH6iEMlL8H6uVb1XQ3Li6W07s-VZBgBSNylbPXgSR425OLgdmfPI1tfpuGxBRUSLnXtjBedMyNGewe9lABKW30ScXoX_-hm2HzHatyQgj2HtmfZOcnVxB_XH1pG9TRFIVPOV7wbiXlaqT83dQAma9YITuqTHgPfFBPwGxMjvTfMMj9DADUvTlbOrAQA31aqtsAH9ft8K_EL8LAQr7am6lKIiBiohg5EPmQVk3tV_hIW"
                alt="Happy Golden Retriever leaning head"
                className="w-full h-full object-cover brightness-90"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Overlay Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/20 z-10" />

        {/* Brand identity */}
        <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
          <span className="material-symbols-outlined text-[28px] text-primary-fixed">pets</span>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">Don Perro</span>
        </div>

        {/* Dynamic testimonial / quote overlay */}
        <div className="absolute bottom-8 left-8 right-8 z-20 space-y-4">
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.div
                key="login-quote"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-2xl font-semibold italic text-white leading-snug font-heading">
                  "Only the best for the one who greets you first."
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full border border-primary-fixed overflow-hidden flex-shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqDTGD2gYIP4QQ47-fErTbTTEDl8vuSprt1v6EE-gJVRNWXED5InP66GvpZQpd11D_BWhdMJ4dMzy_oYVDiu1wIWjHKLtv9Zs1GObtLPHVwWWl5Drmpo6sdY1RbfLbE_L9R5EFHOsszvqHdFaJMBrZOzayZt_JgJUkU2F5ny48Ur_QVuajMeuJqdc7tEph3zBjrGDYhgHm8mEi7ujSQNgC9yiqustp1id5ETqiNKS9nZz53aqu5xpFW70qOaEUjG_pxr9Os0UoicpO"
                      alt="Julian Rossi avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">Julian Rossi</p>
                    <p className="text-xs text-white/70 mt-1">Premium Member since 2021</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register-quote"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-2xl font-semibold italic text-white leading-snug font-heading">
                  "Elevate your pet's lifestyle with premium, organic care."
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 text-on-primary-container font-extrabold text-sm">
                    DP
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">Don Perro Club</p>
                    <p className="text-xs text-white/70 mt-1">Curated with love for active pets</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT INTERACTIVE FORM CONTAINER */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-10 md:px-12 bg-surface overflow-y-auto h-full">
        
        {/* Mobile Brand Header */}
        <div className="flex items-center gap-2 mb-8 md:hidden justify-center">
          <span className="material-symbols-outlined text-[24px] text-primary">pets</span>
          <span className="font-heading font-extrabold text-lg tracking-tight text-primary">Don Perro</span>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface font-heading">
                {mode === "login" ? "Welcome Back!" : "Account Created!"}
              </h2>
              <p className="text-sm text-secondary max-w-sm mx-auto">
                Authentication successful. Preparing your personalized pet boutique catalog now...
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-primary font-bold">
                <Loader2 className="w-4 h-4 animate-spin" /> Redirecting shortly...
              </div>
            </motion.div>
          ) : mode === "login" ? (
            // ================== LOGIN CONTAINER ==================
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-extrabold font-heading text-on-surface leading-tight tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-sm text-secondary mt-1">
                  Sign in to access your pet's curated collection.
                </p>
              </div>

              {/* Social Login */}
              <button 
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-[1.5px] border-outline-variant rounded-full text-on-surface font-semibold text-xs hover:bg-surface-container-low transition-colors duration-200 cursor-pointer"
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcZOvH0jK-aZgG_Ndja_oOaFOV-VQOwG6lk9Vzv0D5JLx7XAlADTUJ0bJDtj7Sgnu4JAZkEXo81rgJFEZBWS6dTirHxKtr_SnElEMcY8vX1HaA9TrCn8W5g7_9nx_T3hI6KeWyLiIxuBngqvaV0cYjrfdVSPkN6wd18tcaVg-PHMOgiXcxe1LfFv8qJH78kle2nHnHf0biPRV4oMk55Y1KIYxmWnnraeCQKxanq4pCKY3lW3-Em6JLtLi6Qm0B02gUKzafW5f7vDvQ"
                  alt="Google G Logo"
                  className="w-4 h-4 object-contain"
                />
                Sign in with Google
              </button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-outline-variant/50"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface px-2">
                  or email
                </span>
                <div className="flex-grow border-t border-outline-variant/50"></div>
              </div>

              {/* In-app Credentials Input */}
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                <FormNotice message={formError} />
                <div className="space-y-1">
                  <label htmlFor="login-email" className="text-xs font-semibold text-secondary ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-surface-container-low border-[1.5px] border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-secondary/40"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label htmlFor="login-pass" className="text-xs font-semibold text-secondary">
                      Password
                    </label>
                    <Link href="#forgot-password" className="text-xs font-bold text-primary hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <input
                    type="password"
                    id="login-pass"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Shopify verifies securely"
                    className="w-full bg-surface-container-low border-[1.5px] border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-secondary/40"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="login-remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-container cursor-pointer"
                  />
                  <label htmlFor="login-remember" className="text-xs font-semibold text-secondary cursor-pointer select-none">
                    Keep me signed in
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-full shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-secondary">
                New to Don Perro?{" "}
                <button
                  onClick={() => handleToggleMode("register")}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </motion.div>
          ) : (
            // ================== REGISTER CONTAINER ==================
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-extrabold font-heading text-on-surface leading-tight tracking-tight">
                  Join the Pack
                </h2>
                <p className="text-sm text-secondary mt-1">
                  Start shopping for premium, curated pet essentials.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3">
                <FormNotice message={formError} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="reg-first" className="text-xs font-semibold text-secondary ml-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="reg-first"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full bg-surface-container-low border-[1.5px] border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-secondary/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="reg-last" className="text-xs font-semibold text-secondary ml-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="reg-last"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full bg-surface-container-low border-[1.5px] border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-secondary/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-email" className="text-xs font-semibold text-secondary ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="w-full bg-surface-container-low border-[1.5px] border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-secondary/40"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-pass" className="text-xs font-semibold text-secondary ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="reg-pass"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-surface-container-low border-[1.5px] border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-secondary/40"
                  />
                </div>



                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="reg-terms"
                    required
                    checked={regTerms}
                    onChange={(e) => setRegTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-container cursor-pointer mt-0.5"
                  />
                  <label htmlFor="reg-terms" className="text-xs font-semibold text-secondary cursor-pointer select-none leading-normal">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary font-bold hover:underline">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary font-bold hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !regTerms}
                  className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-full shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-secondary">
                Already have an account?{" "}
                <button
                  onClick={() => handleToggleMode("login")}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic bottom subtle terms overlay */}
        <div className="mt-8 flex justify-center gap-6 opacity-40 text-[11px] font-bold text-secondary">
          <Link href="/privacy" className="hover:text-on-surface hover:underline transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-on-surface hover:underline transition-colors">
            Terms of Use
          </Link>
        </div>

      </div>
    </div>
  );
}
