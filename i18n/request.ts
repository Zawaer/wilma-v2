import { getRequestConfig } from 'next-intl/server';
import { getLocaleFromCookies } from "@/lib/locale";
 
export default getRequestConfig(async () => {
  const locale = await getLocaleFromCookies();
 
  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default
  };
});