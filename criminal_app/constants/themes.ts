export type ThemeColors = {
  background: string; surface: string; text: string; secondaryText: string;
  primary: string; border: string; header: string; headerText: string; dark: boolean;
};

export const themes: Record<string, ThemeColors> = {
  White: { background: '#ffffff', surface: '#f2f2f2', text: '#111111', secondaryText: '#666666', primary: '#790db3', border: '#cccccc', header: '#790db3', headerText: '#ffffff', dark: false },
  Black: { background: '#080808', surface: '#202020', text: '#ffffff', secondaryText: '#cccccc', primary: '#790db3', border: '#666666', header: '#202020', headerText: '#ffffff', dark: true },
  Purple: { background: '#240c35', surface: '#3b1853', text: '#ffffff', secondaryText: '#ddc5ed', primary: '#8535bb', border: '#956aaf', header: '#651099', headerText: '#ffffff', dark: true },
  Red: { background: '#fff1f1', surface: '#ffe0e0', text: '#421313', secondaryText: '#805353', primary: '#b32626', border: '#cda1a1', header: '#b32626', headerText: '#ffffff', dark: false },
  Green: { background: '#f0fff1', surface: '#dcf1de', text: '#163b20', secondaryText: '#50725a', primary: '#26743a', border: '#a0c5a7', header: '#26743a', headerText: '#ffffff', dark: false },
  Blue: { background: '#0c203d', surface: '#18365b', text: '#ffffff', secondaryText: '#bccfea', primary: '#2668b4', border: '#6884a7', header: '#174a85', headerText: '#ffffff', dark: true },
};
export type ThemeName = keyof typeof themes;
