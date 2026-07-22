import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/_layout/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="flex flex-col justify-center gap-4 p-12">
			<h1 className="text-4xl font-extrabold tracking-tight">
				Master Liga Online
			</h1>
			<p className="text-lg text-muted-foreground">
				Painel para administrar sua ML Online
			</p>
		</div>
	);
}
