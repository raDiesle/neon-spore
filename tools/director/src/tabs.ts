/** Buttons carrying `data-tab`, pages with the matching `tab-<name>` id. */
export function bindTabs(bar: string): void {
  for (const tab of document.querySelectorAll<HTMLElement>(`${bar} button`)) {
    tab.addEventListener("click", () => {
      for (const other of document.querySelectorAll(`${bar} button`)) {
        other.classList.toggle("on", other === tab);
      }
      for (const page of document.querySelectorAll(".tabpage")) {
        page.classList.toggle("on", page.id === `tab-${tab.dataset.tab}`);
      }
    });
  }
}

/**
 * `EXPAND ALL` over one panel's detail expanders. The panels are lists first,
 * so every expander opens shut; this is for the other reading, the one where
 * you want the whole of what the spec says about the accepted creatures in
 * one scroll rather than nine clicks.
 */
export function bindExpanders(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("button[data-expand]")) {
    const selector = button.dataset.expand;
    if (!selector) continue;
    button.addEventListener("click", () => {
      const open = button.dataset.state !== "open";
      for (const box of document.querySelectorAll<HTMLDetailsElement>(`${selector} details`)) {
        box.open = open;
      }
      button.dataset.state = open ? "open" : "shut";
      button.textContent = open ? "COLLAPSE ALL" : "EXPAND ALL";
    });
  }
}
