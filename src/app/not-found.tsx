import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocalizedText } from "@/src/components/i18n";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <LocalizedText message="pageNotFound" />
          </CardTitle>
          <CardDescription>
            <LocalizedText message="notFound" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center w-full">
          <Button className="w-full  relative" variant="outline">
            <LocalizedText message="goHome" />
            <Link href="/" className="absolute inset-0" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
