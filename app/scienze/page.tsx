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
              Le potenzialità delle biotecnologie
            </h2>
            <p className="mt-4 text-gray-700">
              Le biotecnologie sono una delle innovazioni più interessanti del
              nostro tempo. Usarle bene può aiutarci a risolvere problemi
              enormi, come la fame nel mondo, le malattie delle piante e i
              cambiamenti climatici. Gli OGM, per esempio, permettono di
              migliorare le coltivazioni rendendole più resistenti e nutrienti.
              Questo significa produrre di più con meno risorse, riducendo anche
              l'impatto ambientale.
            </p>
            <p className="mt-4 text-gray-700">
              In un periodo in cui il clima è sempre più instabile e la
              popolazione mondiale continua a crescere, trovare soluzioni
              sostenibili non è più un'opzione, è una necessità. Non possiamo
              affidarci solo ai metodi tradizionali, servono strumenti nuovi. E
              le biotecnologie, se usate bene, lo sono.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
              <li>Colture più forti, che resistono a siccità e malattie.</li>
              <li>
                Meno pesticidi = meno inquinamento e rischi per la salute.
              </li>
              <li>Alimenti più ricchi di vitamine e sostanze utili.</li>
              <li>
                Più resa = meno bisogno di disboscare per creare nuovi campi.
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
              Rischi e dubbi da considerare
            </h2>
            <p className="mt-4 text-gray-700">
              Detto questo, è importante essere critici. Gli OGM non sono magia,
              e dietro c'è un sistema complesso, fatto anche di interessi
              economici. Un rischio reale è che poche grandi aziende controllino
              i semi, togliendo indipendenza agli agricoltori. Inoltre, creare
              piante geneticamente uniformi può danneggiare la biodiversità, che
              invece è una risorsa vitale.
            </p>
            <p className="mt-4 text-gray-700">
              Alcune persone sono anche preoccupate per la salute, anche se ad
              oggi non ci sono prove concrete che gli OGM facciano male. Però la
              mancanza di informazioni chiare e l'etichettatura poco trasparente
              aumentano la diffidenza. La scienza va avanti, ma serve anche
              comunicare bene e coinvolgere le persone.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
              <li>
                Rischio di ridurre la varietà genetica delle coltivazioni.
              </li>
              <li>
                Controllo eccessivo da parte delle multinazionali agricole.
              </li>
              <li>Scarsa trasparenza nelle informazioni per i consumatori.</li>
              <li>
                Timori legittimi che meritano risposte, non banalizzazioni.
              </li>
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
              La mia riflessione
            </h2>
            <p className="mt-4 text-gray-700">
              Personalmente non penso che gli OGM siano da evitare a
              prescindere, ma neanche da accettare senza farsi domande. Come
              ogni tecnologia, dipende da come la usiamo e da chi la controlla.
              Non possiamo restare indifferenti: serve informarsi, discutere e
              scegliere con la testa.
            </p>
            <p className="mt-4 text-gray-700">
              Questo progetto nasce dalla voglia di capirne di più. Non mi
              bastava dire “gli OGM fanno bene” o “fanno male”. Volevo sapere
              perché, leggere studi, confrontare idee. E ho capito che la verità
              è più complessa. Le biotecnologie possono davvero migliorare il
              nostro futuro, ma solo se le guidiamo con etica, responsabilità e
              una visione sostenibile.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
