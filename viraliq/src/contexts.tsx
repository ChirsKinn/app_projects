import React, { createContext, useContext, useEffect, useState } from "react";
import { Dataset, Draft, Mode } from "./types";
import * as store from "./database";
const dark = {
  bg: "#090f1d",
  card: "#141e30",
  text: "#f4f7ff",
  muted: "#96a6c1",
  line: "#283650",
  blue: "#438bff",
  input: "#0e1728",
};
const light = {
  bg: "#eef3fa",
  card: "#ffffff",
  text: "#14213b",
  muted: "#53657f",
  line: "#ced9e8",
  blue: "#2166d6",
  input: "#f3f6fb",
};
const ThemeContext = createContext({
  colors: dark,
  isDark: true,
  toggle: () => {},
});
export const useTheme = () => useContext(ThemeContext);
type State = {
  datasets: Dataset[];
  drafts: Draft[];
  active?: Dataset;
  mode: Mode;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  select: (id: string) => Promise<void>;
  setMode: (m: Mode) => Promise<void>;
};
const DatasetContext = createContext<State>(null!);
export const useData = () => useContext(DatasetContext);
export function Providers({ children }: { children: React.ReactNode }) {
  const [isDark, setDark] = useState(true),
    [datasets, setDatasets] = useState<Dataset[]>([]),
    [drafts, setDrafts] = useState<Draft[]>([]),
    [active, setActive] = useState<Dataset>(),
    [mode, setModeState] = useState<Mode>("Demo"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  async function refresh() {
    try {
      const ds = await store.listDatasets(),
        dr = await store.listDrafts(),
        selected = await store.setting("active");
      setDatasets(ds);
      setDrafts(dr);
      const id = ds.find((d) => d.id === selected)?.id ?? ds[0]?.id;
      setActive(id ? await store.getDataset(id) : undefined);
      await store.setting("active", id ?? "");
      setError("");
    } catch {
      setError(
        "Your saved research couldn’t be loaded. Reload saved research to try again. If this keeps happening, reopen the app.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function select(id: string) {
    const d = await store.getDataset(id);
    if (!d)
      throw Error(
        "This dataset is no longer available. Select another saved dataset in history, or analyze a topic.",
      );
    await store.setting("active", id);
    setActive(d);
  }
  async function setMode(m: Mode) {
    await store.setting("mode", m);
    setModeState(m);
  }
  useEffect(() => {
    void (async () => {
      try {
        setDark((await store.setting("theme")) !== "light");
        setModeState(
          (await store.setting("mode")) === "Live" ? "Live" : "Demo",
        );
        await refresh();
      } catch {
        setError(
          "Your saved preferences couldn’t be loaded. Reload saved research to try again, or reopen the app.",
        );
        setLoading(false);
      }
    })();
    return store.observeExpiry(() => {
      void refresh();
    });
  }, []);
  function toggle() {
    const next = !isDark;
    void store
      .setting("theme", next ? "dark" : "light")
      .then(() => setDark(next))
      .catch(() =>
        setError(
          "Your appearance preference couldn’t be saved. Try switching the theme again.",
        ),
      );
  }
  return (
    <ThemeContext.Provider
      value={{ colors: isDark ? dark : light, isDark, toggle }}
    >
      <DatasetContext.Provider
        value={{
          datasets,
          drafts,
          active,
          mode,
          loading,
          error,
          refresh,
          select,
          setMode,
        }}
      >
        {children}
      </DatasetContext.Provider>
    </ThemeContext.Provider>
  );
}
