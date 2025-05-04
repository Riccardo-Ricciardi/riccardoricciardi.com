import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="mx-auto flex items-center justify-center py-12 px-4 h-screen"
      style={{ width: "clamp(0px, 80%, 1200px)" }}
    >
      <Card className="w-full max-w-md border-grid shadow-none p-6 flex flex-col">
        <CardHeader className="p-0 text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mb-4 mx-auto" />
          <CardTitle className="text-3xl font-bold">
            404 – Risorsa non trovata
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-base text-muted-foreground text-center">
            La risorsa che stai cercando potrebbe essere stata rimossa,
            spostata, o non è mai esistita.
          </p>
          <Link href="/" passHref>
            <Button className="w-full bg-red-600 text-white text-lg py-4 px-8 rounded-md mt-6">
              Torna alla Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}


// aggiuungere language support e sistemare con il tema scuro