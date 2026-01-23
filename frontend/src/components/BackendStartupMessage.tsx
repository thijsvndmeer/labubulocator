import { Server, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BackendStartupMessage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative bg-background border rounded-full p-8 shadow-2xl overflow-hidden group">
                    <Server className="h-16 w-16 text-primary animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
            </div>

            <div className="max-w-md space-y-4">
                <h3 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                    Backend is Warming Up
                </h3>

                <p className="text-muted-foreground text-lg leading-relaxed">
                    The Labubu Locator service is currently initializing. Our backend takes a few moments to spin up from a cold start.
                </p>

                <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium border animate-bounce">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Estimated wait: 1-2 minutes</span>
                    </div>

                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="group relative px-8 py-6 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                        <RefreshCw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                        Check Again
                    </Button>
                </div>
            </div>

            <div className="mt-12 flex gap-1 items-center justify-center">
                <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="h-1 w-1 rounded-full bg-primary animate-bounce" />
            </div>
        </div>
    );
};
