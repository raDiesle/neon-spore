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
