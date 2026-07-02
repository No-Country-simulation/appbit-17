import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { IconButton } from "../components/IconButton";
import { Logo } from "../components/Logo";
import { SideAppBar, type SideNavItem } from "../components/SideAppBar";
import { TopAppBar } from "../components/TopAppBar";
import { BarsIcon, BellIcon, DocIcon, GearIcon, PinIcon } from "../components/icons";
import { NotificationsPanel } from "../features/notifications";
import { SettingsPanel } from "../features/settings";
import { PageFallback } from "./PageFallback";

/** Navegação lateral (mock). `value` = caminho da rota; `labelKey` = chave i18n (ns nav). */
const NAV_ITEMS = [
  { value: "/app/map", labelKey: "map", icon: <PinIcon /> },
  { value: "/app/analytics", labelKey: "analytics", icon: <BarsIcon /> },
  { value: "/app/reports", labelKey: "reports", icon: <DocIcon /> },
  { value: "/app/alerts", labelKey: "alerts", icon: <BellIcon /> },
] as const;

/** Usuário exibido na casca (mock — app sem autenticação). */
const MOCK_USER = { name: "Carla Mendes" };

/**
 * Casca do app — barra superior (full-width) e, abaixo, coluna branca da
 * sidebar + conteúdo da rota (<Outlet/>).
 */
export function AppLayout() {
  const { t } = useTranslation(["nav", "common"]);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Rótulos traduzidos reativos ao idioma; alimentam sidebar e título da topbar.
  const nav: SideNavItem[] = NAV_ITEMS.map((item) => ({
    value: item.value,
    icon: item.icon,
    label: t(item.labelKey),
  }));
  const current = nav.find((item) => pathname.startsWith(item.value));

  return (
    // h-dvh (viewport DINÂMICO) em vez de min-h-screen (=100vh): no iOS o 100vh
    // conta a área atrás das barras do Safari/Chrome → conteúdo do rodapé (mapa
    // + prompt) ficava cortado/escondido. Com dvh + BottomNav no fluxo (não
    // fixed), topbar + conteúdo + nav cabem exatos na área visível.
    <div className="flex h-dvh flex-col overflow-hidden bg-app">
      {/* Skip-link — primeiro elemento focável; visível só ao receber foco (teclado). */}
      <a
        href="#main-content"
        className="sr-only rounded-btn-sm bg-primary px-4 py-2 text-body text-ink-inverse focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        {t("common:skipToContent")}
      </a>

      <TopAppBar
        brand={<Logo variant="dark" className="h-7 w-auto" />}
        title={current?.label}
        actions={
          <>
            <IconButton variant="ghost" label={t("settings")} onClick={() => setSettingsOpen(true)}>
              <GearIcon />
            </IconButton>
            <IconButton
              variant="ghost"
              label={t("notifications")}
              onClick={() => setNotificationsOpen(true)}
            >
              <BellIcon />
            </IconButton>
          </>
        }
        user={MOCK_USER}
      />

      <div className="flex min-h-0 flex-1">
        {/* Coluna branca da sidebar — só em telas médias+; no mobile vira BottomNav. */}
        <aside className="hidden w-40 items-center justify-center bg-surface px-4 md:flex">
          <SideAppBar
            items={nav}
            activeValue={current?.value ?? ""}
            onNavigate={(value) => navigate(value)}
          />
        </aside>

        {/* min-h-0: deixa o <main> encolher p/ as páginas roláveis (Analytics/
            Reports) scrollarem por dentro. A BottomNav é irmã no fluxo (abaixo),
            então o conteúdo já para acima dela — sem reserva de padding. */}
        <main id="main-content" className="flex min-h-0 flex-1 flex-col">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Navegação inferior — só mobile (wrapper md:hidden). */}
      <div className="md:hidden">
        <BottomNav
          items={nav}
          activeValue={current?.value ?? ""}
          onNavigate={(value) => navigate(value)}
          aria-label={t("common:mainNav")}
        />
      </div>

      <NotificationsPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
