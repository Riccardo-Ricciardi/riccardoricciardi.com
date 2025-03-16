import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

const ScrollableCardComponent = () => {
  return (
    <div className="w-full">
      <div
        className="mx-auto justify-between items-center grid grid-cols-3 gap-4"
        style={{ width: "clamp(0px, 80%, 1200px)" }}
      >
        {Array.from({ length: 99 }).map((_, index) => (
          <Card className="bg-primary" key={index}>
            <CardHeader>
              <CardTitle className="text-primary-foreground">
                Card {index + 1}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                This is a sample card number {index + 1}.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <button className="bg-blue-500 text-white py-2 px-4 rounded">
                Button
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScrollableCardComponent;
