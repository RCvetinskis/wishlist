import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocalizedText } from "@/src/components/i18n";

export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <LocalizedText message="pageNotFound" />
          </CardTitle>
          <CardDescription>
            <LocalizedText message="notFound" />
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
