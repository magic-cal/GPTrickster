import React, { useEffect, useState } from "react";
import {
  Script,
  Scripts,
  createScript,
  getScripts,
  storeScript,
} from "@/utils/Scripts";

const ScriptComponent: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);

  const addScript = () => {
    const newScript = createScript();
    storeScript(newScript);
    setScripts([...scripts, newScript]);
  };
  useEffect(() => {
    const storedScripts = getScripts();

    const scripts: Script[] = [];
    for (const key in storedScripts) {
      scripts.push(storedScripts[key]);
    }
    setScripts(scripts);
  }, []);
  return (
    <>
      <h1 className="">Scripts</h1>
      <div>
        {scripts.map((script) => (
          <div className="pl-6" key={script.name}>
            <h2>{script.name}</h2>
            <ul className="pl-6">
              {script.scriptItems.map((x) => (
                <li key={x.id}>{x.value}</li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <button onClick={addScript}>Add Script</button>
        </div>
      </div>
    </>
  );
};

export default ScriptComponent;
