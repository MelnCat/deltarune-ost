import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/trivia/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/trivia/"!</div>;
}
