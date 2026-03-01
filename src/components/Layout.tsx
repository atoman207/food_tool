"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logoImage from "@/assets/logo.png";
import {
  Search, Menu, X, ChevronRight, ChevronDown,
  User, LogOut, LayoutDashboard, ShieldCheck, Settings,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/contexts/LanguageContext";

/** Circular avatar or default icon */
function AvatarBadge({ src, alt, size = 32 }: { src?: string | null; alt: string; size?: number }) {
  if (src) {
    return (
      <div
        className="rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image src={src} alt={alt} width={size} height={size} className="object-cover w-full h-full" unoptimized />
      </div>
    );
  }
  return (
    <div
      className="rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <User className="text-primary" style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}

/** EN / 日本語 language toggle */
function LangToggle() {
  const { lang, setLang } = useTranslation();
  return (
    <div className="flex border overflow-hidden text-xs font-bold flex-shrink-0">
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        EN
      </button>
      <div className="w-px bg-border" />
      <button
        onClick={() => setLang("ja")}
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "ja"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        日本語
      </button>
    </div>
  );
}

/** User menu dropdown — avatar + name, then My Page / Profile / Logout */
function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { t, lang } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isAdmin = profile?.role === "admin";
  const displayName = profile?.username ? `@${profile.username}` : (profile?.name || t.nav.user);
  const avatarSrc = profile?.avatar_url || null;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border border-transparent hover:border-border hover:bg-muted transition-all duration-150"
      >
        <AvatarBadge src={avatarSrc} alt={displayName} size={30} />
        <span className="max-w-[110px] truncate text-sm font-semibold hidden sm:block">{displayName}</span>
        {isAdmin && <ShieldCheck className="h-3.5 w-3.5 text-primary hidden sm:block" />}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-0 w-60 bg-background border border-t-2 border-t-primary shadow-xl z-50 animate-dropdown-open origin-top">
          {/* User info header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b">
            <AvatarBadge src={avatarSrc} alt={displayName} size={42} />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{profile?.name || t.nav.user}</p>
              {profile?.username && (
                <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
              )}
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-0.5">
                  <ShieldCheck className="h-2.5 w-2.5" /> 管理者
                </span>
              )}
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              <span>{lang === "ja" ? "マイページ" : "My Page"}</span>
            </Link>
            <Link
              href="/dashboard?tab=profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>{lang === "ja" ? "プロフィール変更" : "Edit Profile"}</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin-dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">{lang === "ja" ? "管理者画面" : "Admin Panel"}</span>
              </Link>
            )}
            <div className="my-1 border-t" />
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/8 w-full transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{lang === "ja" ? "ログアウト" : t.nav.logout}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { t, lang } = useTranslation();

  const navItems = [
    { label: t.nav.suppliers,  path: "/suppliers" },
    { label: t.nav.marketplace, path: "/marketplace" },
    { label: t.nav.news,       path: "/news" },
  ];

  const isAdmin = profile?.role === "admin";
  const displayName = profile?.username ? `@${profile.username}` : (profile?.name || t.nav.user);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b-2 border-border">
      <div className="container flex h-20 items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 group">
          <Image
            src={logoImage}
            alt="F&B Portal - Singapore F&B Supplier & Chef Network"
            height={44}
            width={220}
            className="h-11 w-auto object-contain transition-transform group-hover:-translate-y-0.5"
            priority
          />
        </Link>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-0.5 ml-auto">

          {/* Navigation */}
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-150 group ${
                (pathname ?? "").startsWith(item.path)
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200 ${
                  (pathname ?? "").startsWith(item.path)
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-50"
                }`}
              />
            </Link>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-2" />

          {/* Search */}
          <Link href="/suppliers">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {/* Language toggle */}
          <LangToggle />

          {/* Auth */}
          <div className="ml-1">
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="font-bold">
                    {t.nav.register}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          <LangToggle />
          <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 bg-background animate-fade-in">
          <nav className="container py-4 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors hover:bg-muted ${
                  (pathname ?? "").startsWith(item.path) ? "bg-primary/8 text-primary border-l-4 border-primary" : ""
                }`}
              >
                {item.label}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}

            <div className="border-t my-2" />

            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-l-4 border-primary">
                  <AvatarBadge src={profile?.avatar_url || null} alt={displayName} size={44} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{profile?.name || t.nav.user}</p>
                    {profile?.username && (
                      <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                    )}
                    {isAdmin && (
                      <span className="text-[10px] font-bold text-primary">管理者</span>
                    )}
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 text-sm font-medium hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {lang === "ja" ? "マイページ" : "My Page"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/dashboard?tab=profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 text-sm font-medium hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {lang === "ja" ? "プロフィール変更" : "Edit Profile"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin-dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 text-sm font-medium hover:bg-muted text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      {lang === "ja" ? "管理者画面" : "Admin Panel"}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium hover:bg-muted text-destructive"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    {lang === "ja" ? "ログアウト" : t.nav.logout}
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 text-sm font-medium hover:bg-muted"
                >
                  {t.nav.login}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 text-sm font-bold bg-primary/5 text-primary hover:bg-primary/10"
                >
                  {t.nav.register}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t-2 bg-foreground text-background">
      <div className="container py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-xs">食</span>
              </div>
              <span className="font-black text-background">{t.nav.brand}</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">{t.footer.tagline}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm text-background/80 uppercase tracking-widest text-xs">{t.footer.services}</h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><Link href="/suppliers" className="hover:text-background transition-colors">{t.footer.supplierSearch}</Link></li>
              <li><Link href="/marketplace" className="hover:text-background transition-colors">{t.footer.marketplace}</Link></li>
              <li><Link href="/news" className="hover:text-background transition-colors">{t.footer.news}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm text-background/80 uppercase tracking-widest text-xs">{t.footer.info}</h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.terms}</a></li>
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.privacy}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm text-background/80 uppercase tracking-widest text-xs">{t.footer.contact}</h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.contactForm}</a></li>
              <li><Link href="/admin-dashboard" className="hover:text-background transition-colors">{t.footer.adminLogin}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-background/20 text-center text-xs text-background/40">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
