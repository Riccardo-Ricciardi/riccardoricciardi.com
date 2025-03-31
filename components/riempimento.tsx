import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";

const ScrollableCardComponent = () => {
  return (
    <div className="pt-8 w-full">
      <div
        className="mx-auto grid gap-4 sm:grid-cols-1 md:grid-cols-2"
        style={{ width: "clamp(0px, 80%, 1200px)" }}
      >
        <Card className="border-grid shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-secondary-foreground">
              Italiano: Raccolta senza confini
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Link href="/italiano">
              <button className="bg-blue-600 text-white py-2 px-4 rounded">
                Scopri di più
              </button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-grid shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-secondary-foreground">
              Scienze: Biotecnologie e OGM
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Link href="/scienze">
              <button className="bg-blue-600 text-white py-2 px-4 rounded">
                Scopri di più
              </button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ScrollableCardComponent;
