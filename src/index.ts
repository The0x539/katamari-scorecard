import { createElement, render } from "preact";
import { Scorecard, theFile } from "./scorecard.tsx";

import "./screen.css";

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
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
    if (file) {
      e.preventDefault();
      theFile.value = file;
      break;
    }
  }
});
