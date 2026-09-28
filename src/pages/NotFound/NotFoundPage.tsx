import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-5xl font-bold text-primary-hover">404</p>
      <h1 className="text-xl font-bold">Seite nicht gefunden</h1>
      <Button asChild>
        <Link to="/boards">Zur Boards-Übersicht</Link>
      </Button>
    </div>
  );
}
