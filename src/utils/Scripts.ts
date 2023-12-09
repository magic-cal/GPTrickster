import { v4 as uuidv4 } from "uuid";

const SCRIPT_BASE_KEY = "SCRIPT_KEY";
export const SCRIPT_DEFAULT_ID = "default";

export type Script = {
  name: string;
  scriptItems: ScriptItem[];
};

export type ScriptItem = {
  id: string;
  value: string;
  prompt?: string;
};

export type Scripts = Record<string, Script>;

export const createScript = (): Script => ({
  name: SCRIPT_DEFAULT_ID,
  scriptItems: [
    {
      id: uuidv4(),
      value: "Hello World",
    },
  ],
});

// Store script in local storage
export const storeScript = (script: Script, id?: string) => {
  const scripts = getScripts();
  id = id || SCRIPT_DEFAULT_ID;
  localStorage.setItem(
    SCRIPT_BASE_KEY,
    JSON.stringify({
      ...scripts,
      [id]: script,
    })
  );
  return id;
};

// Get a script from local storage
export const getScript = (id: string) => {
  const scripts = getScripts();
  return scripts[id];
};

// Update a script in local storage
export const updateScript = (id: string, script: Partial<Script>) => {
  const scripts = getScripts();
  localStorage.setItem(
    SCRIPT_BASE_KEY,
    JSON.stringify({
      ...scripts,
      [id]: {
        ...scripts[id],
        ...script,
      },
    })
  );
};

export const deleteScript = (id: string) => {
  const scripts = getScripts();
  delete scripts[id];
  localStorage.setItem(SCRIPT_BASE_KEY, JSON.stringify(scripts));
};

export const getScripts: () => Scripts = () => {
  const scripts = localStorage.getItem(SCRIPT_BASE_KEY);
  return scripts ? JSON.parse(scripts) : {};
};

export const clearScripts = () => {
  localStorage.removeItem(SCRIPT_BASE_KEY);
};
