export const setElementStylesWithCleanup = (element: HTMLElement, styles: Partial<CSSStyleDeclaration>) => {
  Object.assign(element.style, styles)

  return () => {
    Object.keys(styles).forEach((key) => {
      Object.assign(element.style, {
        [key]: '',
      })
    })
  }
}
