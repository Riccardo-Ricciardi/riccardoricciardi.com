import { buildThemeCss, getThemeSettings } from "@/utils/theme/fetch";

export async function DynamicThemeVars() {
  const settings = await getThemeSettings();
  const css = buildThemeCss(settings);
  if (!css) return null;
  return (
    <style id="dynamic-theme" dangerouslySetInnerHTML={{ __html: css }} />
  );
}
