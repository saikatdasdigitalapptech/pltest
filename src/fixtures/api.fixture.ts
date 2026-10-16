import { test as base } from "@playwright/test";
import { PublicSiteService } from "../services/public-site.service";
export const test = base.extend<{ site: PublicSiteService }>({
  site: async ({ request }, use) => {
    await use(new PublicSiteService(request));

    //there is static block of production dployment api
  },
});
export { expect } from "@playwright/test";
