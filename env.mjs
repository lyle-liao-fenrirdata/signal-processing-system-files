import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z
      .string()
      .regex(
        /^mongodb:\/\/[\w]{1,}:[\w]{1,}@[A-Za-z0-9\-\.\~\(\)\'\!\*\:\@\,\_\;\+\&\=\?\/\#\+\&\=]{1,}$/gm
      )
      .default(
        "mongodb://nextjs:nextjs@mongo-rs1:27041/nextjs?replicaSet=RS&authSource=nextjs&retryWrites=true&w=majority&directConnection=true"
      ),
    MOUNT_DIR: z.string().default("./public/mount/"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {},

  /**
   * If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually.
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    MOUNT_DIR: process.env.MOUNT_DIR,
  },

  /**
   * For Next.js >= 13.4.4, you only need to destructure client variables:
   */
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
