import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import { AIPrompt } from "../../components/AIPrompt";
import { MapFilterBar, type MapFilterItem } from "../../components/MapFilterBar";
import { QueryFlowModal } from "../../features/query-flow";
import { regionStyle } from "./regions";
import bairros from "./bairros.json";

// Corrige os ícones padrão do Leaflet com bundlers (Vite resolve as imagens
// como URLs; sem isso o marker fica quebrado). Mantido para os ícones de
// referência que serão renderizados sobre os bairros futuramente.
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/** Bairros de Florianópolis (fronteiras do OpenStreetMap, admin_level=10). */
const BAIRROS = bairros as FeatureCollection;

/** Enquadramento inicial = limites dos bairros de Florianópolis. Derivar dos
 *  dados é mais robusto que center/zoom fixos — abre sempre enquadrado em Floripa. */
const BOUNDS = L.geoJSON(BAIRROS).getBounds();

/** Temas do mapa (filtro client-side; o `/mapa` traz tudo).
 *  TODO(i18n): mover rótulos p/ um namespace de mapa quando houver. */
const THEMES: MapFilterItem[] = [
  { value: "overview", label: "Visão Geral" },
  { value: "education", label: "Educação" },
  { value: "health", label: "Saúde" },
  { value: "housing", label: "Habitação" },
  { value: "employment", label: "Emprego" },
];

/**
 * Tela inicial do app — mapa temático de Florianópolis: basemap claro sem
 * rótulos + bairros coloridos em tons pastel. O prompt da IA fica sobreposto.
 *
 * Estrutura preparada para receber, no futuro, uma camada de <Marker>/divIcon
 * com ícones de referência sobre os bairros (o markerPane do Leaflet já
 * renderiza ícones acima dos polígonos, sem ajuste de z-index).
 */
export function MapPage() {
  const [prompt, setPrompt] = useState("");
  const [flowOpen, setFlowOpen] = useState(false);
  // Muda a cada abertura → remonta o modal pegando o texto atual do prompt.
  const [flowSeed, setFlowSeed] = useState(0);
  // Tema selecionado — filtra os dados do mapa no cliente (TODO: aplicar quando
  // o contrato do /mapa expor o campo de tema/indicador).
  const [theme, setTheme] = useState("overview");

  return (
    <div className="relative isolate z-0 min-h-0 w-full flex-1">
      <MapContainer
        bounds={BOUNDS}
        boundsOptions={{ padding: [24, 24] }}
        scrollWheelZoom
        className="h-full w-full"
      >
        {/* Basemap claro sem nomes de rua — só o contexto água/terra (CARTO). */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Bairros — manchas pastel com borda branca; tooltip no hover. */}
        <GeoJSON
          data={BAIRROS}
          style={regionStyle}
          onEachFeature={(feature, layer) => {
            const name = feature.properties?.name as string | undefined;
            if (name) layer.bindTooltip(name, { sticky: true });
          }}
        />
      </MapContainer>

      {/* Filtros temáticos sobrepostos — topo, centralizados. Mesma lógica de
          pointer-events do prompt: overlay não captura, faixa captura. */}
      <div className="pointer-events-none absolute inset-x-0 top-8 z-[1000] flex justify-center px-4">
        <MapFilterBar
          className="pointer-events-auto max-w-full"
          aria-label="Filtros do mapa"
          value={theme}
          onChange={setTheme}
          items={THEMES}
        />
      </div>

      {/* Prompt da IA sobreposto — centralizado, deslocado do rodapé.
          pointer-events-none no overlay deixa o mapa arrastável ao redor;
          z acima dos panes/controls do Leaflet. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-[1000] flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-2xl">
          <AIPrompt
            value={prompt}
            onChange={setPrompt}
            onSubmit={() => {
              setFlowSeed((s) => s + 1);
              setFlowOpen(true);
            }}
          />
        </div>
      </div>

      {/* Fluxo de consulta — abre ao enviar o prompt, com o texto digitado. */}
      <QueryFlowModal
        key={flowSeed}
        open={flowOpen}
        onOpenChange={setFlowOpen}
        initialQuestion={prompt}
      />
    </div>
  );
}
