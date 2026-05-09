import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LocaleNotFound() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md border-grid p-6 shadow-none flex flex-col items-center text-center">
        <CardHeader className="p-0 mb-6 w-full">
          <h1
            className="font-extrabold leading-none text-destructive"
            style={{ fontSize: "clamp(6rem, 20vw, 12rem)" }}
          >
            404
          </h1>
        </CardHeader>
        <CardContent className="flex w-full flex-col gap-6 p-0">
          <p className="text-base text-muted-foreground">
            Page not found.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
