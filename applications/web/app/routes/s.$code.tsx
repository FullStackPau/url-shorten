import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { urlService } from "@url-shortener/engine";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (!code) {
    throw new Response("Not Found", { status: 404 });
  }

  const originalUrl = await urlService.resolve(code);

  if (!originalUrl) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(originalUrl);
}
