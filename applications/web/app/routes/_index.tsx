import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/_index";
import {
  baseUrl,
  urlService,
  InvalidUrlError,
  CodeGenerationError,
} from "@url-shortener/engine";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

function buildShortUrl(code: string): string {
  return baseUrl ? `${baseUrl}/s/${code}` : `/s/${code}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export async function loader() {
  const urls = await urlService.list();

  return {
    shortBaseLabel: baseUrl ? `${baseUrl}/s/` : "/s/",
    urls: urls.map((url) => ({
      code: url.code,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      shortUrl: buildShortUrl(url.code),
      createdAt: dateFormatter.format(url.createdAt),
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = String(formData.get("url") ?? "");

  try {
    const record = await urlService.shorten(url);
    return { shortenedUrl: buildShortUrl(record.code) };
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      return { error: error.message };
    }
    if (error instanceof CodeGenerationError) {
      return { error: error.message };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { shortBaseLabel, urls } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
        <section className="max-w-2xl space-y-4 text-center">
          <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            URL Shortener
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Shorten links without the noise.
          </h1>
          <p className="text-base leading-7 text-muted-foreground md:text-lg">
            Paste a long URL and get a clean short link ready to share.
          </p>
        </section>

        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Create short URL</CardTitle>
            <CardDescription>
              Your shortened URL will start with {shortBaseLabel}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form method="post" className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="url"
                  className="text-sm font-medium text-foreground"
                >
                  Destination URL
                </label>
                <Input
                  id="url"
                  type="url"
                  name="url"
                  placeholder="https://example.com/very-long-url"
                  required
                  aria-invalid={Boolean(actionData?.error)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Shortening..." : "Shorten URL"}
              </Button>
            </Form>

            {actionData?.shortenedUrl && (
              <Alert>
                <AlertTitle>Your shortened URL is ready</AlertTitle>
                <AlertDescription className="mt-2 flex flex-col gap-3">
                  <a
                    href={actionData.shortenedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-medium text-foreground underline underline-offset-4"
                  >
                    {actionData.shortenedUrl}
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      navigator.clipboard.writeText(actionData.shortenedUrl)
                    }
                  >
                    Copy link
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {actionData?.error && (
              <Alert variant="destructive">
                <AlertTitle>Unable to shorten URL</AlertTitle>
                <AlertDescription>{actionData.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your links</CardTitle>
            <CardDescription>
              {urls.length > 0
                ? "Every shortened URL with its click statistics."
                : "No links yet. Shorten your first URL above."}
            </CardDescription>
          </CardHeader>
          {urls.length > 0 && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short link</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urls.map((url) => (
                    <TableRow key={url.code}>
                      <TableCell>
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground underline underline-offset-4"
                        >
                          /s/{url.code}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                          title={url.originalUrl}
                        >
                          {url.originalUrl}
                        </a>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {url.clicks}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {url.createdAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  );
}
