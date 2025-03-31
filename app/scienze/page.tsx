import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function BiotecnologieOGM() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-200 to-blue-200 flex flex-col justify-center items-center p-6 space-y-8">
      <h1 className="text-4xl font-bold text-center text-green-700 mb-6">
        Biotecnologie e OGM: Scelte Consapevoli per il Futuro
      </h1>
      <div className="max-w-4xl w-full space-y-6">
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden border-none">
          <Image
            src="https://images.unsplash.com/photo-1641903202531-bfa6bf0c6419?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Vantaggi degli OGM"
            width={800}
            height={400}
            className="w-full h-80 object-cover"
          />
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-green-600">
              Vantaggi delle Biotecnologie e degli OGM
            </h2>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
              <li>
                Aumento della produttività agricola e lotta alla fame nel mondo.
              </li>
              <li>
                Riduzione dell’uso di pesticidi grazie a colture geneticamente
                migliorate.
              </li>
              <li>
                Potenziale miglioramento del valore nutrizionale degli alimenti.
              </li>
              <li>
                Minimizzazione dell’impatto ambientale con pratiche agricole
                sostenibili.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-lg overflow-hidden border-none">
          <Image
            src="https://images.unsplash.com/photo-1416169607655-0c2b3ce2e1cc?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Svantaggi degli OGM"
            width={800}
            height={400}
            className="w-full h-80 object-cover"
          />
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-red-600">
              Svantaggi e Criticità
            </h2>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
              <li>
                Impatto potenziale sulla biodiversità e sugli ecosistemi
                naturali.
              </li>
              <li>
                Preoccupazioni riguardo alla sicurezza alimentare e alla salute
                umana.
              </li>
              <li>
                Rischi di dipendenza economica dagli agricoltori verso grandi
                multinazionali.
              </li>
              <li>Questioni etiche legate all’ingegneria genetica.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-lg overflow-hidden border-none">
          <Image
            src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Riflessione sugli OGM"
            width={800}
            height={400}
            className="w-full h-80 object-cover"
          />
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-blue-600">
              Riflessione Personale
            </h2>
            <p className="mt-4 text-gray-700">
              Le biotecnologie e gli OGM offrono straordinarie opportunità per
              il progresso scientifico e la sicurezza alimentare, ma è
              fondamentale adottare un approccio responsabile e trasparente. Un
              regolamento rigoroso e una costante valutazione dei rischi possono
              garantire un equilibrio tra innovazione e sicurezza ambientale.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
