import { createElement, render } from "preact";

import { fileState, Scorecard } from "./ui/scorecard.tsx";
import { dataReady } from "./data.ts";
import { handleFolder, isDirectory } from "./filesystem-descent.tsx";

import "./screen.css";

if (!window["Temporal"]) {
  await import("temporal-polyfill/global");
}

dataReady.then(() => {
  render(createElement(Scorecard, {}), document.body);
});

document.addEventListener("dragover", (e: DragEvent) => {
  if (!e.dataTransfer) return;

  const list = e.dataTransfer.items;
  for (let i = 0; i < list.length; i++) {
    if (list[i].kind === "file") {
      e.dataTransfer.dropEffect = "copy";
      e.preventDefault();
      break;
    }
  }
});

document.addEventListener("drop", (e: DragEvent) => {
  const list = e.dataTransfer?.items ?? [];

  for (let i = 0; i < list.length; i++) {
    const file = list[i].getAsFile();
    if (!file) {
      continue;
    }

    const entry = list[i].webkitGetAsEntry?.();
    if (isDirectory(entry)) {
      handleFolder(entry);
    } else {
      fileState.setSource(file);
    }
    e.preventDefault();

    break;
  }
});
