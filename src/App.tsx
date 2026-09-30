import { useState } from "react";
import Toolbar from "./components/Toolbar";
import MapCanvas from "./Mapcanvas";
import SidePanel from "./components/Sidepanel";
import { useGraph } from "./components/Usegraph";
import { DEFAULT_SRC } from "./Constants";
import type { Mode, Role, Size } from "./components/Types";
import "./App.css";

export default function App() {
  const graph = useGraph();
  const [mode, setMode] = useState<Mode>("points");
  const [role, setRole] = useState<Role>("poi"); // type du prochain point placé
  const [src, setSrc] = useState(DEFAULT_SRC);
  const [size, setSize] = useState<Size>({ w: 1508, h: 1043 }); // mis à jour au chargement de l'image

  const changeImage = (url: string) => {
    graph.reset();
    setSrc(url);
  };

  return (
    <div className="app">
      <Toolbar mode={mode} onChange={setMode} />
      <MapCanvas src={src} size={size} onSizeChange={setSize} mode={mode} role={role} graph={graph} />
      <SidePanel mode={mode} role={role} onRoleChange={setRole} graph={graph} size={size} onImageChange={changeImage} />
    </div>
  );
}